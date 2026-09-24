import { WifiSlashIcon } from "@phosphor-icons/react";
import {
	Alert,
	AlertDescription,
	AlertTitle,
} from "@workspace/ui/components/alert";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { readCachedSchedule } from "@/lib/schedule-cache";

function OfflineBanner() {
	const cached = readCachedSchedule();

	return (
		<Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
			<WifiSlashIcon />
			<AlertTitle>Hors ligne</AlertTitle>
			<AlertDescription>
				{cached
					? `Affichage du dernier planning enregistré (le ${format(
							parseISO(cached.savedAt),
							"dd MMM 'à' HH:mm",
							{ locale: fr },
						)})`
					: null}
			</AlertDescription>
		</Alert>
	);
}

export { OfflineBanner };
