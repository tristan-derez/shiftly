import { CircleNotchIcon } from "@phosphor-icons/react";
import { createFileRoute } from "@tanstack/react-router";
import { Button } from "@workspace/ui/components/button";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { toast } from "@workspace/ui/components/toast";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { EditCalendarLayout } from "@/components/edit-calendar-layout";
import {
	type ScheduleFormValues,
	toCalendarUpdate,
	toEditableValues,
} from "@/lib/schedule";
import {
	useCurrentSchedule,
	useUpdateCalendarSchedule,
} from "@/queries/schedule";

export const Route = createFileRoute("/_auth/edit")({
	component: Edit,
});

function Edit() {
	const [showWeekHeader, setShowWeekHeader] = useState(false);
	const [ready, setReady] = useState(false);
	const scheduleQuery = useCurrentSchedule();
	const updateCalendar = useUpdateCalendarSchedule();

	const { control, handleSubmit, reset } = useForm<ScheduleFormValues>({
		defaultValues: { days: [] },
	});

	useEffect(() => {
		if (scheduleQuery.data) {
			reset(toEditableValues(scheduleQuery.data.weeks));
			setReady(true);
		}
	}, [scheduleQuery.data, reset]);

	async function onSubmit(values: ScheduleFormValues) {
		try {
			await updateCalendar.mutateAsync(toCalendarUpdate(values));
			toast.add({ title: "Planning enregistré", type: "success" });
		} catch {
			toast.add({
				title: "Oops !",
				description: "Une erreur est survenue",
				type: "error",
			});
		}
	}

	if (scheduleQuery.isError)
		return <div>Erreur lors du chargement du planning</div>;

	return (
		<div className="flex flex-col gap-2 lg:gap-6 pt-4 pb-8">
			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-2 lg:gap-6"
			>
				<div className="flex justify-between font-bold text-sm lg:text-md">
					<div>Modifier mes horaires</div>
					<div className="flex gap-1.5 items-center self-end">
						<span className="text-xs md:text-sm text-muted-foreground">
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

				{scheduleQuery.isPending || !ready ? (
					<div
						className="flex justify-center py-8 text-primary"
						aria-label="Chargement"
					>
						<CircleNotchIcon
							className="size-6 animate-spin"
							aria-hidden="true"
						/>
					</div>
				) : null}

				{scheduleQuery.data && ready ? (
					<EditCalendarLayout
						showWeekHeader={showWeekHeader}
						weeks={scheduleQuery.data.weeks}
						control={control}
					/>
				) : null}

				{scheduleQuery.data && ready ? (
					<Button
						type="submit"
						disabled={updateCalendar.isPending}
						className="self-end"
					>
						{updateCalendar.isPending ? "Enregistrement..." : "Enregistrer"}
					</Button>
				) : null}
			</form>
		</div>
	);
}
