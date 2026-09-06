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
import { DayCard } from "@/components/day-card";

type CalendarLayoutProps = {
	weeks?: WeekSchedule[];
	showWeekHeader?: boolean; // showWeekHeader display the week number and date range
};

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

// Fills a week's days with "unplanned" for any date missing from `days`.
// `days` is expected to be sparse: only planned/rest days come from the backend.
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

function CalendarLayout({
	weeks,
	showWeekHeader = false,
}: CalendarLayoutProps) {
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
				{calendarWeeks.map((week) => (
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
							{week.days.map((day) => (
								<DayCard
									key={day.date}
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

export type { CalendarLayoutProps, WeekSchedule };
export { CalendarLayout };
