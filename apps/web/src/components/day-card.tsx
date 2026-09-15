import type { DaySchedule, Shift } from "@workspace/api";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

type DayCardProps = {
	day: DaySchedule;
	showWeekHeader?: boolean;
};

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function getShiftMinutes(shift: Shift): number {
	const [startHours, startMinutes] = shift.start.split(":").map(Number);
	const [endHours, endMinutes] = shift.end.split(":").map(Number);

	return endHours * 60 + endMinutes - (startHours * 60 + startMinutes);
}

function formatHours(minutes: number): string {
	const hours = Math.floor(minutes / 60);
	const remainingMinutes = minutes % 60;

	return remainingMinutes === 0
		? `${hours}h`
		: `${hours}h${remainingMinutes.toString().padStart(2, "0")}`;
}

function getBreakMinutes(minutes: number): number {
	const hours = minutes / 60;

	return hours > 5.75 ? 20 : Math.round(hours * 3);
}

function DayCard({ day, showWeekHeader = false }: DayCardProps) {
	const date = parseISO(day.date);
	const weekday = capitalize(format(date, "EE", { locale: fr }));
	const fullDate = format(date, "dd/MM");

	const shifts = [day.morning, day.afternoon].filter(
		(shift): shift is Shift => shift !== null,
	);

	const totalMinutes = shifts.reduce(
		(total, shift) => total + getShiftMinutes(shift),
		0,
	);

	function renderShift(shift: Shift | null) {
		if (!shift) {
			return (
				<div className="flex h-9 items-center justify-center text-xs text-muted-foreground">
					/
				</div>
			);
		}

		const minutes = getShiftMinutes(shift);
		const breakMinutes = getBreakMinutes(minutes);

		return (
			<div className="flex h-9 flex-col items-center justify-center text-xs">
				<span className="flex items-center gap-1">
					<strong>{shift.job}</strong> • {shift.start} – {shift.end}
				</span>
				<span className="text-muted-foreground">
					{formatHours(minutes)} ({breakMinutes} min)
				</span>
			</div>
		);
	}

	return (
		<Card
			size="sm"
			className={cn(
				"h-36",
				day.status === "planned" && "bg-planned-day",
				day.status === "rest" && "bg-rest-day",
				day.status === "unplanned" && "bg-muted",
			)}
		>
			<CardHeader className="text-center text-sm">
				<CardTitle>
					{showWeekHeader ? `${weekday} ${fullDate}` : fullDate}
				</CardTitle>

				{day.status === "planned" ? (
					<CardDescription>
						{formatHours(totalMinutes)} travaillées
					</CardDescription>
				) : null}
			</CardHeader>

			<CardContent className="flex flex-1 flex-col items-center justify-center">
				{day.status === "rest" ? (
					<span className="flex flex-col gap-2 text-xs text-muted-foreground">
						Repos
					</span>
				) : day.status === "unplanned" ? (
					<span className="text-xs text-muted-foreground">Non planifié</span>
				) : (
					<div className="flex w-full flex-col">
						{renderShift(day.morning)}
						{renderShift(day.afternoon)}
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export type { DayCardProps };
export { DayCard };
