import { createFileRoute } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { useState } from "react";
import {
	CalendarLayout,
	type WeekSchedule,
} from "@/components/calendar-layout";

export const Route = createFileRoute("/")({
	component: Index,
});

const week: WeekSchedule[] = [
	{
		weekNumber: 35,
		startDate: "2026-08-24",
		endDate: "2026-08-30",
		days: [
			{
				date: "2026-08-24",
				status: "planned",
				morning: { start: "9:00", end: "13:00", job: "F" },
				afternoon: { start: "14:00", end: "18:00", job: "Amb" },
			},
			{
				date: "2026-08-25",
				status: "planned",
				morning: { start: "8:00", end: "12:00", job: "L1" },
				afternoon: { start: "13:00", end: "16:45", job: "Ram" },
			},
			{ date: "2026-08-26", status: "rest", morning: null, afternoon: null },
			{
				date: "2026-08-27",
				status: "planned",
				morning: { start: "9:00", end: "12:30", job: "Firam" },
				afternoon: { start: "14:00", end: "18:00", job: "L2" },
			},
			{
				date: "2026-08-28",
				status: "planned",
				morning: { start: "9:00", end: "13:00", job: "Ram" },
				afternoon: { start: "14:00", end: "17:15", job: "F" },
			},
			{
				date: "2026-08-29",
				status: "planned",
				morning: { start: "8:00", end: "12:00", job: "Amb" },
				afternoon: null,
			},
			{ date: "2026-08-30", status: "rest", morning: null, afternoon: null },
		],
	},
	{ weekNumber: 36, startDate: "2026-08-31", endDate: "2026-09-06", days: [] },
	{ weekNumber: 37, startDate: "2026-09-07", endDate: "2026-09-13", days: [] },
	{ weekNumber: 38, startDate: "2026-09-14", endDate: "2026-09-20", days: [] },
	{ weekNumber: 39, startDate: "2026-09-21", endDate: "2026-09-27", days: [] },
];

function Index() {
	const [showWeekHeader, setShowWeekHeader] = useState(false);

	return (
		<div className="flex flex-col gap-2 lg:gap-6">
			<div className="flex justify-between">
				<div>Tristan Derez</div>
				<div className="flex gap-1.5 items-center self-end">
					<span className="text-sm text-muted-foreground">
						Afficher les en-têtes de semaines
					</span>
					<Switch
						checked={showWeekHeader}
						onCheckedChange={setShowWeekHeader}
						aria-label="Afficher les en-têtes de semaines"
					/>
				</div>
			</div>
			<Separator />
			<CalendarLayout showWeekHeader={showWeekHeader} weeks={week} />
		</div>
	);
}
