import { type DaySchedule, type DayStatus, jobs } from "@workspace/api";
import { Button } from "@workspace/ui/components/button";
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle,
} from "@workspace/ui/components/card";
import { Field } from "@workspace/ui/components/field";
import { Input } from "@workspace/ui/components/input";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@workspace/ui/components/select";
import { cn } from "@workspace/ui/lib/utils";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
	type Control,
	Controller,
	type FieldPath,
	useWatch,
} from "react-hook-form";
import type { ScheduleFormValues } from "@/lib/schedule";

type EditDayCardProps = {
	control: Control<ScheduleFormValues>;
	index: number;
	day: DaySchedule;
	showWeekHeader?: boolean;
};

const statusOptions: { value: DayStatus; label: string }[] = [
	{ value: "planned", label: "Planifié" },
	{ value: "rest", label: "Repos" },
	{ value: "unplanned", label: "Non planifié" },
];

const statusBackground: Record<DayStatus, string> = {
	planned: "bg-planned-day",
	rest: "bg-rest-day",
	unplanned: "bg-muted",
};

const statusPath = (index: number) =>
	`days.${index}.status` as FieldPath<ScheduleFormValues>;

const shiftPath = (
	index: number,
	period: "morning" | "afternoon",
	field: "job" | "start" | "end",
) => `days.${index}.${period}.${field}` as FieldPath<ScheduleFormValues>;

function capitalize(value: string): string {
	return value.charAt(0).toUpperCase() + value.slice(1);
}

function ShiftFields({
	control,
	index,
	period,
}: {
	control: Control<ScheduleFormValues>;
	index: number;
	period: "morning" | "afternoon";
}) {
	return (
		<div className="flex w-full flex-col gap-1">
			<Controller
				control={control}
				name={shiftPath(index, period, "job")}
				render={({ field }) => (
					<Field className="w-full">
						<Select
							value={(field.value as string) || null}
							onValueChange={(value) => field.onChange(value ?? "")}
						>
							<SelectTrigger
								size="sm"
								className="w-full text-base lg:text-[0.625rem]"
							>
								<SelectValue placeholder="Job" />
							</SelectTrigger>
							<SelectContent>
								{jobs.map((job) => (
									<SelectItem key={job} value={job}>
										{job}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</Field>
				)}
			/>
			<div className="flex items-center gap-1">
				<Controller
					control={control}
					name={shiftPath(index, period, "start")}
					render={({ field }) => (
						<Field className="min-w-0 flex-1">
							<Input
								className="text-center text-base lg:text-[0.625rem]"
								placeholder="08:00"
								aria-label={`Début ${period}`}
								{...field}
								value={field.value as string}
							/>
						</Field>
					)}
				/>
				<span className="text-muted-foreground">–</span>
				<Controller
					control={control}
					name={shiftPath(index, period, "end")}
					render={({ field }) => (
						<Field className="min-w-0 flex-1">
							<Input
								className="text-center text-base lg:text-[0.625rem]"
								placeholder="15:30"
								aria-label={`Fin ${period}`}
								{...field}
								value={field.value as string}
							/>
						</Field>
					)}
				/>
			</div>
		</div>
	);
}

function EditDayCard({
	control,
	index,
	day,
	showWeekHeader = false,
}: EditDayCardProps) {
	const status: DayStatus =
		(useWatch({ control, name: statusPath(index) }) as DayStatus | undefined) ??
		day.status;

	const date = parseISO(day.date);
	const weekday = capitalize(format(date, "EE", { locale: fr }));
	const fullDate = format(date, "dd/MM");

	return (
		<Card size="sm" className={cn("h-56", statusBackground[status])}>
			<CardHeader className="text-center text-xs">
				<CardTitle>
					{showWeekHeader ? `${weekday} ${fullDate}` : fullDate}
				</CardTitle>

				<Controller
					control={control}
					name={statusPath(index)}
					render={({ field }) => (
						<div className="flex flex-wrap justify-center gap-0.5">
							{statusOptions.map((option) => (
								<Button
									key={option.value}
									type="button"
									size="xs"
									variant={field.value === option.value ? "default" : "ghost"}
									onClick={() => field.onChange(option.value)}
									aria-pressed={field.value === option.value}
								>
									{option.label}
								</Button>
							))}
						</div>
					)}
				/>
			</CardHeader>

			<CardContent className="flex flex-1 flex-col items-center justify-center">
				{status === "rest" ? (
					<span className="text-xs text-muted-foreground">Repos</span>
				) : status === "unplanned" ? (
					<span className="text-xs text-muted-foreground">Non planifié</span>
				) : (
					<div className="flex w-full flex-col gap-1">
						<ShiftFields control={control} index={index} period="morning" />
						<ShiftFields control={control} index={index} period="afternoon" />
					</div>
				)}
			</CardContent>
		</Card>
	);
}

export { EditDayCard };
