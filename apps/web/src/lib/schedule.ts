import type {
	CalendarScheduleUpdate,
	DaySchedule,
	DayStatus,
	Job,
	Shift,
	WeekSchedule,
} from "@workspace/api";

export type EditableShift = {
	start: string;
	end: string;
	job: string;
};

export type EditableDay = {
	date: string;
	status: DayStatus;
	morning: EditableShift;
	afternoon: EditableShift;
};

export type ScheduleFormValues = {
	days: EditableDay[];
};

const emptyShift: EditableShift = { start: "", end: "", job: "" };

function toEditableShift(shift: Shift | null): EditableShift {
	if (!shift) return { ...emptyShift };

	return {
		start: shift.start.slice(0, 5),
		end: shift.end.slice(0, 5),
		job: shift.job ?? "",
	};
}

export function toEditableDay(day: DaySchedule): EditableDay {
	return {
		date: day.date,
		status: day.status,
		morning: toEditableShift(day.morning),
		afternoon: toEditableShift(day.afternoon),
	};
}

export function toEditableValues(
	weeks: readonly WeekSchedule[],
): ScheduleFormValues {
	return {
		days: weeks.flatMap((week) => week.days.map(toEditableDay)),
	};
}

function toShift(shift: EditableShift): Shift | null {
	const start = shift.start.trim();
	const end = shift.end.trim();
	const job = shift.job.trim();

	if (!start || !end) return null;

	return {
		start,
		end,
		job: job ? (job as Job) : null,
	};
}

export function toCalendarUpdate(
	values: ScheduleFormValues,
): CalendarScheduleUpdate {
	return {
		days: values.days.map((day) => ({
			date: day.date,
			status: day.status,
			morning: day.status === "planned" ? toShift(day.morning) : null,
			afternoon: day.status === "planned" ? toShift(day.afternoon) : null,
		})),
	};
}
