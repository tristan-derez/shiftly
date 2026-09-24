import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CalendarScheduleUpdate,
	CurrentScheduleResponse,
	DaySchedule,
} from "@workspace/api";
import { Schema } from "effect";
import { readCachedSchedule, writeCachedSchedule } from "@/lib/schedule-cache";

const apiUrl = import.meta.env.VITE_BETTER_AUTH_URL;

async function fetchCurrentSchedule() {
	let response: Response;
	try {
		response = await fetch(`${apiUrl}/api/schedule/current`, {
			credentials: "include",
		});
	} catch (error) {
		const cached = readCachedSchedule();
		if (cached) return cached.schedule;
		throw error;
	}

	if (!response.ok) {
		throw new Error("Erreur lors de la récupération du planning");
	}

	const payload: unknown = await response.json();
	const schedule = Schema.decodeUnknownSync(CurrentScheduleResponse)(payload);
	writeCachedSchedule(schedule);
	return schedule;
}

export function useCurrentSchedule() {
	return useQuery({
		queryKey: ["schedule", "current"],
		queryFn: fetchCurrentSchedule,
		networkMode: "offlineFirst",
		retry: 0,
	});
}

async function updateDaySchedule(day: DaySchedule) {
	const response = await fetch(`${apiUrl}/api/schedule`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(day),
	});

	if (!response.ok) {
		throw new Error("Erreur lors de la modification du planning");
	}

	return response.json();
}

export function useUpdateDaySchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateDaySchedule,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["schedule", "current"] });
		},
	});
}

async function updateCalendarSchedule(calendar: CalendarScheduleUpdate) {
	const response = await fetch(`${apiUrl}/api/schedule/calendar`, {
		method: "PUT",
		credentials: "include",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(calendar),
	});

	if (!response.ok) {
		throw new Error("Erreur lors de la modification du planning");
	}

	return response.json();
}

export function useUpdateCalendarSchedule() {
	const queryClient = useQueryClient();

	return useMutation({
		mutationFn: updateCalendarSchedule,
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["schedule", "current"] });
		},
	});
}
