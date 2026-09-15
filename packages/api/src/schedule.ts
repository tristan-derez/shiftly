import { Schema } from "effect";

export const jobs = ["F", "Amb", "L1", "L2", "FRam", "Ram", "DPH"] as const;

export const Job = Schema.Literal(...jobs);
export type Job = typeof Job.Type;

export const DayStatus = Schema.Literal("planned", "rest", "unplanned");
export type DayStatus = typeof DayStatus.Type;

export const Shift = Schema.Struct({
	start: Schema.String,
	end: Schema.String,
	job: Schema.NullOr(Job),
});
export type Shift = typeof Shift.Type;

export const DaySchedule = Schema.Struct({
	date: Schema.String,
	status: DayStatus,
	morning: Schema.NullOr(Shift),
	afternoon: Schema.NullOr(Shift),
});
export type DaySchedule = typeof DaySchedule.Type;

export const WeekSchedule = Schema.Struct({
	weekNumber: Schema.Number,
	startDate: Schema.String,
	endDate: Schema.String,
	days: Schema.mutable(Schema.Array(DaySchedule)),
});
export type WeekSchedule = typeof WeekSchedule.Type;

export const CurrentScheduleResponse = Schema.Struct({
	weeks: Schema.Array(WeekSchedule),
});
export type CurrentScheduleResponse = typeof CurrentScheduleResponse.Type;

export const CalendarScheduleUpdate = Schema.Struct({
	days: Schema.Array(DaySchedule),
});
export type CalendarScheduleUpdate = typeof CalendarScheduleUpdate.Type;
