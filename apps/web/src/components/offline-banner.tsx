import { WifiSlashIcon, XIcon } from "@phosphor-icons/react";
import {
	Alert,
	AlertAction,
	AlertDescription,
	AlertTitle,
} from "@workspace/ui/components/alert";
import { Button } from "@workspace/ui/components/button";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { readCachedSchedule } from "@/lib/schedule-cache";

function OfflineBanner() {
	const [dismissed, setDismissed] = useState(false);
	const [cached] = useState(readCachedSchedule);

	if (dismissed) return null;

	const description = cached
		? `Vous consultez la dernière version enregistrée sur cet appareil (${format(
				parseISO(cached.savedAt),
				"dd MMM 'à' HH:mm",
				{ locale: fr },
			)}).`
		: "Aucun planning n’est enregistré sur cet appareil. Connectez-vous à Internet pour l’afficher.";
	const offlineNotice =
		"Vous ne pouvez pas modifier le planning ni fermer votre session tant que vous êtes hors ligne.";

	return (
		<Alert className="border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-50">
			<WifiSlashIcon />
			<AlertTitle>Hors ligne</AlertTitle>
			<AlertDescription>
				{description} {offlineNotice}
			</AlertDescription>
			<AlertAction>
				<Button
					type="button"
					variant="ghost"
					size="icon-sm"
					className="opacity-70 hover:opacity-100"
					aria-label="Fermer l’alerte hors ligne"
					onClick={() => setDismissed(true)}
				>
					<XIcon aria-hidden="true" className="size-4" />
				</Button>
			</AlertAction>
		</Alert>
	);
}

export { OfflineBanner };
