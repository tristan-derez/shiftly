import { useQuery } from "@tanstack/react-query";
import { CurrentScheduleResponse } from "@workspace/api";
import { Schema } from "effect";

const apiUrl = import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:3008";

async function fetchCurrentSchedule() {
	const response = await fetch(`${apiUrl}/api/schedule/current`, {
		credentials: "include",
	});

	if (!response.ok) {
		throw new Error("Erreur lors de la récupération du planning");
	}

	const payload: unknown = await response.json();
	return Schema.decodeUnknownSync(CurrentScheduleResponse)(payload);
}

export function useCurrentSchedule() {
	return useQuery({
		queryKey: ["schedule", "current"],
		queryFn: fetchCurrentSchedule,
	});
}
