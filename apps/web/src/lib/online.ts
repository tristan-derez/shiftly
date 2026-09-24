import { onlineManager } from "@tanstack/react-query";
import { useSyncExternalStore } from "react";

if (typeof navigator !== "undefined") {
	onlineManager.setOnline(navigator.onLine);
}

export function useOnline(): boolean {
	return useSyncExternalStore(onlineManager.subscribe, isOnline, () => true);
}

export function isOnline(): boolean {
	return (
		onlineManager.isOnline() &&
		(typeof navigator === "undefined" || navigator.onLine)
	);
}
