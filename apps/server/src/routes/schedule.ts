import { HttpRouter, HttpServerResponse } from "@effect/platform";
import {
	CurrentScheduleResponse,
	DaySchedule,
	WeekSchedule,
} from "@workspace/api";
import { and, asc, eq, gte, lte } from "drizzle-orm";
import { Effect } from "effect";
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
		if (row.period && row.shiftStart && row.shiftEnd && row.job) {
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
);
