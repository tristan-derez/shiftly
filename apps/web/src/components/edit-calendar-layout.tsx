import type { DaySchedule, WeekSchedule } from "@workspace/api";
import {
	addDays,
	endOfWeek,
	format,
	getWeek,
	parseISO,
	startOfWeek,
} from "date-fns";
import { fr } from "date-fns/locale";
import type { Control } from "react-hook-form";
import { EditDayCard } from "@/components/edit-day-card";
import type { ScheduleFormValues } from "@/lib/schedule";

type EditCalendarLayoutProps = {
	weeks?: readonly WeekSchedule[];
	showWeekHeader?: boolean;
	control: Control<ScheduleFormValues>;
};

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function fillWeekDays(weekStart: Date, days: DaySchedule[]): DaySchedule[] {
	const daysByDate = new Map(days.map((day) => [day.date, day]));

	return Array.from({ length: 7 }, (_, index) => {
		const date = format(addDays(weekStart, index), "yyyy-MM-dd");

		return (
			daysByDate.get(date) ?? {
				date,
				status: "unplanned",
				morning: null,
				afternoon: null,
			}
		);
	});
}

function getUnplannedWeek(weekStart: Date): WeekSchedule {
	const weekNumber = getWeek(weekStart, {
		weekStartsOn: 1,
		firstWeekContainsDate: 4,
	});

	return {
		weekNumber,
		startDate: format(weekStart, "yyyy-MM-dd"),
		endDate: format(endOfWeek(weekStart, { weekStartsOn: 1 }), "yyyy-MM-dd"),
		days: fillWeekDays(weekStart, []),
	};
}

function EditCalendarLayout({
	weeks,
	showWeekHeader = false,
	control,
}: EditCalendarLayoutProps) {
	const currentWeekStart = startOfWeek(new Date(), {
		weekStartsOn: 1,
	});

	const calendarWeeks: WeekSchedule[] = weeks
		? weeks.map((week) => ({
				...week,
				days: fillWeekDays(parseISO(week.startDate), week.days),
			}))
		: Array.from({ length: 5 }, (_, index) =>
				getUnplannedWeek(addDays(currentWeekStart, index * 7)),
			);

	const weekdays =
		calendarWeeks[0]?.days.map((day) =>
			capitalize(
				format(new Date(day.date), "EEEE", {
					locale: fr,
				}),
			),
		) ?? [];

	const indexedWeeks = calendarWeeks.map((week, weekIndex) => ({
		week,
		startIndex: calendarWeeks
			.slice(0, weekIndex)
			.reduce((total, current) => total + current.days.length, 0),
	}));

	return (
		<div>
			{!showWeekHeader ? (
				<div className="mb-2 hidden grid-cols-7 gap-2 text-center text-sm font-medium lg:grid">
					{weekdays.map((weekday) => (
						<div key={weekday}>{weekday}</div>
					))}
				</div>
			) : null}

			<div className="flex flex-col gap-2">
				{indexedWeeks.map(({ week, startIndex }) => (
					<section key={week.startDate}>
						{showWeekHeader ? (
							<div className="mb-2">
								<h2 className="text-sm font-semibold">
									S{week.weekNumber} · du{" "}
									{format(new Date(week.startDate), "dd/MM", {
										locale: fr,
									})}{" "}
									au{" "}
									{format(new Date(week.endDate), "dd/MM", {
										locale: fr,
									})}
								</h2>
							</div>
						) : null}

						<div className="grid grid-cols-1 gap-2 lg:grid-cols-7">
							{week.days.map((day, dayIndex) => (
								<EditDayCard
									key={day.date}
									control={control}
									index={startIndex + dayIndex}
									day={day}
									showWeekHeader={showWeekHeader}
								/>
							))}
						</div>
					</section>
				))}
			</div>
		</div>
	);
}

export type { EditCalendarLayoutProps };
export { EditCalendarLayout };
