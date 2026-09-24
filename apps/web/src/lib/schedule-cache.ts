import { CurrentScheduleResponse } from "@workspace/api";
import { Schema } from "effect";

const SCHEDULE_CACHE_KEY = "shiftly:schedule";

const CachedSchedule = Schema.Struct({
	savedAt: Schema.String,
	schedule: CurrentScheduleResponse,
});

export type CachedSchedule = typeof CachedSchedule.Type;

export function readCachedSchedule(): CachedSchedule | null {
	try {
		const raw = localStorage.getItem(SCHEDULE_CACHE_KEY);
		if (!raw) return null;
		return Schema.decodeUnknownSync(CachedSchedule)(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function writeCachedSchedule(schedule: CurrentScheduleResponse): void {
	try {
		localStorage.setItem(
			SCHEDULE_CACHE_KEY,
			JSON.stringify({
				savedAt: new Date().toISOString(),
				schedule,
			}),
		);
	} catch (error) {
		console.warn("Unable to cache the schedule for offline use.", error);
	}
}
