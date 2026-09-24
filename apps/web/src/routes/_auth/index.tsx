import { CircleNotchIcon } from "@phosphor-icons/react";
import { createFileRoute, useRouteContext } from "@tanstack/react-router";
import { Separator } from "@workspace/ui/components/separator";
import { Switch } from "@workspace/ui/components/switch";
import { useState } from "react";
import { CalendarLayout } from "@/components/calendar-layout";
import { OfflineBanner } from "@/components/offline-banner";
import { useOnline } from "@/lib/online";
import { useCurrentSchedule } from "@/queries/schedule";

export const Route = createFileRoute("/_auth/")({
	component: Index,
});

function Index() {
	const [showWeekHeader, setShowWeekHeader] = useState(false);
	const online = useOnline();
	const { authData } = useRouteContext({ from: "__root__" });
	const scheduleQuery = useCurrentSchedule();

	if (scheduleQuery.isError)
		return <div>Erreur lors du chargement du planning</div>;

	return (
		<div className="flex flex-col gap-2 lg:gap-6 pt-4 pb-8">
			{!online ? <OfflineBanner /> : null}

			<div className="flex justify-between font-bold text-sm lg:text-md">
				<div>{authData?.user?.name ?? "Mon planning"}</div>
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
			{scheduleQuery.isPending && scheduleQuery.fetchStatus !== "paused" ? (
				<div
					className="flex justify-center py-8 text-primary"
					aria-label="Chargement"
				>
					<CircleNotchIcon className="size-6 animate-spin" aria-hidden="true" />
				</div>
			) : null}
			{scheduleQuery.data ? (
				<CalendarLayout
					showWeekHeader={showWeekHeader}
					weeks={scheduleQuery.data.weeks}
				/>
			) : null}
		</div>
	);
}
