import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
	CalendarScheduleUpdate,
	CurrentScheduleResponse,
	DaySchedule,
} from "@workspace/api";
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
