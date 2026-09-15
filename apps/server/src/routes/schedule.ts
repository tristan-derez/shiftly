import {
	HttpRouter,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import {
	CalendarScheduleUpdate,
	CurrentScheduleResponse,
	DaySchedule,
	WeekSchedule,
} from "@workspace/api";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { Effect, Schema } from "effect";
import { AuthSession } from "../auth.ts";
import { daySchedules, shifts } from "../db/schema/index.ts";
import { requireAuth } from "../middleware/require-auth.ts";
import { DatabaseService } from "../services/database.ts";

const startOfWeek = (date: Date) => {
	const result = new Date(date);
	const day = result.getUTCDay();
	result.setUTCDate(result.getUTCDate() - (day === 0 ? 6 : day - 1));
	return result;
};

const dateOnly = (date: Date) => date.toISOString().slice(0, 10);

const parseTime = (value: string) => {
	const match = value
		.trim()
		.toLowerCase()
		.match(/^(\d{1,2})(?::|\.?)?(\d{2})?\s*(am|pm)?$/);

	if (!match) return null;

	let hour = Number(match[1]);
	const minute = match[2] ? Number(match[2]) : 0;
	const meridiem = match[3];

	if (minute > 59) return null;

	if (meridiem) {
		if (hour < 1 || hour > 12) return null;
		hour = (hour % 12) + (meridiem === "pm" ? 12 : 0);
	} else if (hour > 23) return null;

	return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`;
};

const normalizeUpdate = (input: Schema.Schema.Type<typeof DaySchedule>) => {
	const result = {
		...input,
		morning: null as typeof input.morning,
		afternoon: null as typeof input.afternoon,
	};

	for (const period of ["morning", "afternoon"] as const) {
		const shift = input[period];
		if (!shift) continue;

		const start = parseTime(shift.start);
		const end = parseTime(shift.end);

		if (!start || !end || start >= end) return null;

		result[period] = { ...shift, start, end };
	}

	return result;
};

const updateDaySchedule = Effect.gen(function* () {
	const { user } = yield* AuthSession;
	const { client } = yield* DatabaseService;
	const request = yield* HttpServerRequest.HttpServerRequest;
	const body = yield* request.json.pipe(
		Effect.catchAll(() => Effect.succeed(null)),
	);
	const decoded = Schema.decodeUnknownEither(DaySchedule)(body);

	if (decoded._tag === "Left") {
		return HttpServerResponse.unsafeJson(
			{ message: "Invalid schedule" },
			{ status: 400 },
		);
	}

	const update = normalizeUpdate(decoded.right);
	if (!update) {
		return HttpServerResponse.unsafeJson(
			{ message: "Invalid time range" },
			{ status: 400 },
		);
	}

	const date = new Date(`${update.date}T00:00:00.000Z`);
	const start = startOfWeek(new Date());
	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 34);

	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(update.date) ||
		Number.isNaN(date.getTime()) ||
		date < start ||
		date > end
	) {
		return HttpServerResponse.unsafeJson(
			{ message: "Date is outside the current schedule" },
			{ status: 400 },
		);
	}

	yield* Effect.tryPromise({
		try: () =>
			client.transaction(async (tx) => {
				const [day] = await tx
					.insert(daySchedules)
					.values({
						userId: user.id,
						date: update.date,
						status: update.status,
					})
					.onConflictDoUpdate({
						target: [daySchedules.userId, daySchedules.date],
						set: { status: update.status },
					})
					.returning({ id: daySchedules.id });

				await tx.delete(shifts).where(eq(shifts.dayScheduleId, day.id));

				const values = (["morning", "afternoon"] as const).flatMap((period) => {
					const shift = update[period];
					if (!shift) return [];

					return [
						{
							dayScheduleId: day.id,
							period,
							start: shift.start,
							end: shift.end,
							job: shift.job,
						},
					];
				});

				if (values.length > 0) {
					await tx.insert(shifts).values(values);
				}
			}),
		catch: (cause) => cause,
	});

	yield* Effect.annotateLogsScoped("username", user.username);
	yield* Effect.logInfo("Schedule updated");

	return HttpServerResponse.unsafeJson(
		{ date: update.date, status: update.status },
		{ status: 200 },
	);
}).pipe(
	Effect.catchAll((error) =>
		Effect.logError("Failed to modify schedule", { error }).pipe(
			Effect.as(
				HttpServerResponse.unsafeJson(
					{ message: "Internal Server Error" },
					{ status: 500 },
				),
			),
		),
	),
);

const updateBulkSchedule = Effect.gen(function* () {
	const { user } = yield* AuthSession;
	const { client } = yield* DatabaseService;
	const request = yield* HttpServerRequest.HttpServerRequest;
	const body = yield* request.json.pipe(
		Effect.catchAll(() => Effect.succeed(null)),
	);
	const decoded = Schema.decodeUnknownEither(CalendarScheduleUpdate)(body);

	if (decoded._tag === "Left" || decoded.right.days.length !== 35) {
		return HttpServerResponse.unsafeJson(
			{ message: "The calendar must contain exactly 35 days" },
			{ status: 400 },
		);
	}

	const days = decoded.right.days.map(normalizeUpdate);
	if (days.some((day) => day === null)) {
		return HttpServerResponse.unsafeJson(
			{ message: "Invalid time range" },
			{ status: 400 },
		);
	}

	const start = startOfWeek(new Date());
	const expectedDates = Array.from({ length: 35 }, (_, index) => {
		const date = new Date(start);
		date.setUTCDate(start.getUTCDate() + index);
		return dateOnly(date);
	});
	const updates = days as NonNullable<(typeof days)[number]>[];
	if (
		updates.some(
			(day, index) =>
				day.date !== expectedDates[index] ||
				!/^\d{4}-\d{2}-\d{2}$/.test(day.date),
		)
	) {
		return HttpServerResponse.unsafeJson(
			{ message: "Days must cover the current 35-day calendar" },
			{ status: 400 },
		);
	}

	yield* Effect.tryPromise({
		try: () =>
			client.transaction(async (tx) => {
				for (const update of updates) {
					const [day] = await tx
						.insert(daySchedules)
						.values({
							userId: user.id,
							date: update.date,
							status: update.status,
						})
						.onConflictDoUpdate({
							target: [daySchedules.userId, daySchedules.date],
							set: { status: update.status },
						})
						.returning({ id: daySchedules.id });

					await tx.delete(shifts).where(eq(shifts.dayScheduleId, day.id));

					const values = (["morning", "afternoon"] as const).flatMap(
						(period) => {
							const shift = update[period];
							if (!shift) return [];

							return [
								{
									dayScheduleId: day.id,
									period,
									start: shift.start,
									end: shift.end,
									job: shift.job,
								},
							];
						},
					);

					if (values.length > 0) {
						await tx.insert(shifts).values(values);
					}
				}
			}),
		catch: (cause) => cause,
	});

	yield* Effect.annotateLogsScoped("username", user.username);
	yield* Effect.logInfo("Calendar schedule updated");

	return HttpServerResponse.unsafeJson(
		{ message: "Calendar schedule updated" },
		{ status: 200 },
	);
}).pipe(
	Effect.catchAll((error) =>
		Effect.logError("Failed to modify calendar schedule", {
			error,
		}).pipe(
			Effect.as(
				HttpServerResponse.unsafeJson(
					{ message: "Internal Server Error" },
					{ status: 500 },
				),
			),
		),
	),
);

const getWeekNumber = (date: Date) => {
	const thursday = new Date(date);
	thursday.setUTCDate(date.getUTCDate() + 3);
	const firstThursday = new Date(Date.UTC(thursday.getUTCFullYear(), 0, 4));
	return (
		1 + Math.round((thursday.getTime() - firstThursday.getTime()) / 604800000)
	);
};

const currentSchedule = Effect.gen(function* () {
	const { user } = yield* AuthSession;
	const { client } = yield* DatabaseService;
	const start = startOfWeek(new Date());
	const end = new Date(start);
	end.setUTCDate(end.getUTCDate() + 34);

	const rows = yield* Effect.tryPromise({
		try: () =>
			client
				.select({
					date: daySchedules.date,
					status: daySchedules.status,
					period: shifts.period,
					shiftStart: shifts.start,
					shiftEnd: shifts.end,
					job: shifts.job,
				})
				.from(daySchedules)
				.leftJoin(shifts, eq(shifts.dayScheduleId, daySchedules.id))
				.where(
					and(
						eq(daySchedules.userId, user.id),
						gte(daySchedules.date, dateOnly(start)),
						lte(daySchedules.date, dateOnly(end)),
					),
				)
				.orderBy(asc(daySchedules.date)),
		catch: (cause) => cause,
	});

	const byDate = new Map<
		string,
		{
			date: string;
			status: DaySchedule["status"];
			morning: DaySchedule["morning"];
			afternoon: DaySchedule["afternoon"];
		}
	>();
	for (let index = 0; index < 35; index++) {
		const date = new Date(start);
		date.setUTCDate(start.getUTCDate() + index);
		byDate.set(dateOnly(date), {
			date: dateOnly(date),
			status: "unplanned",
			morning: null,
			afternoon: null,
		});
	}

	for (const row of rows) {
		const day = byDate.get(row.date);
		if (!day) continue;
		day.status = row.status;
		if (row.period && row.shiftStart && row.shiftEnd) {
			day[row.period] = {
				start: row.shiftStart,
				end: row.shiftEnd,
				job: row.job,
			};
		}
	}

	const week: WeekSchedule = {
		weekNumber: getWeekNumber(start),
		startDate: dateOnly(start),
		endDate: dateOnly(end),
		days: [...byDate.values()],
	};

	const weeks = Array.from({ length: 5 }, (_, weekIndex) => {
		const weekStart = new Date(start);
		weekStart.setUTCDate(start.getUTCDate() + weekIndex * 7);
		const weekEnd = new Date(weekStart);
		weekEnd.setUTCDate(weekStart.getUTCDate() + 6);

		return {
			weekNumber: getWeekNumber(weekStart),
			startDate: dateOnly(weekStart),
			endDate: dateOnly(weekEnd),
			days: week.days.slice(weekIndex * 7, weekIndex * 7 + 7),
		};
	});

	return yield* Effect.annotateLogsScoped("username", user.username).pipe(
		Effect.zipRight(
			HttpServerResponse.schemaJson(CurrentScheduleResponse)({
				weeks,
			}),
		),
	);
}).pipe(
	Effect.tap(() => Effect.logInfo("Current schedule retrieved")),
	Effect.catchAll((error) =>
		Effect.logError("Failed to retrieve current schedule", {
			error,
		}).pipe(
			Effect.as(
				HttpServerResponse.unsafeJson(
					{ message: "Internal Server Error" },
					{ status: 500 },
				),
			),
		),
	),
);

export const scheduleRoutes = HttpRouter.empty.pipe(
	HttpRouter.get("/api/schedule/current", requireAuth(currentSchedule)),
	HttpRouter.put("/api/schedule", requireAuth(updateDaySchedule)),
	HttpRouter.put("/api/schedule/calendar", requireAuth(updateBulkSchedule)),
);
