import type { DayStatus, Job } from "@workspace/api";
import { relations, sql } from "drizzle-orm";
import { date, pgEnum, pgTable, time, unique, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.ts";
import { user } from "./user.ts";

const jobValues = [
	"F",
	"Amb",
	"L1",
	"L2",
	"FRam",
	"Ram",
	"DPH",
] as const satisfies readonly Job[];

export const jobEnum = pgEnum("job", jobValues);

const dayStatusValues = [
	"planned",
	"rest",
	"unplanned",
] as const satisfies readonly DayStatus[];

export const dayStatusEnum = pgEnum("day_status", dayStatusValues);

export const shiftPeriodEnum = pgEnum("shift_period", ["morning", "afternoon"]);

export const daySchedules = pgTable(
	"day_schedules",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		userId: uuid("user_id")
			.notNull()
			.references(() => user.id, {
				onDelete: "cascade",
			}),
		date: date("date").notNull(),
		status: dayStatusEnum("status").notNull().default("unplanned"),
		...timestamps,
	},
	(table) => [
		unique("day_schedules_user_date_unique").on(table.userId, table.date),
	],
);

export const shifts = pgTable(
	"shifts",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		dayScheduleId: uuid("day_schedule_id")
			.notNull()
			.references(() => daySchedules.id, {
				onDelete: "cascade",
			}),
		period: shiftPeriodEnum("period").notNull(),
		start: time("start", { precision: 0 }).notNull(),
		end: time("end", { precision: 0 }).notNull(),
		job: jobEnum("job"),
		...timestamps,
	},
	(table) => [
		unique("shifts_day_schedule_period_unique").on(
			table.dayScheduleId,
			table.period,
		),
	],
);

export const daySchedulesRelations = relations(
	daySchedules,
	({ one, many }) => ({
		user: one(user, {
			fields: [daySchedules.userId],
			references: [user.id],
		}),
		shifts: many(shifts),
	}),
);

export const shiftsRelations = relations(shifts, ({ one }) => ({
	daySchedule: one(daySchedules, {
		fields: [shifts.dayScheduleId],
		references: [daySchedules.id],
	}),
}));

export type DayScheduleRow = typeof daySchedules.$inferSelect;
export type NewDayScheduleRow = typeof daySchedules.$inferInsert;
export type ShiftRow = typeof shifts.$inferSelect;
export type NewShiftRow = typeof shifts.$inferInsert;
