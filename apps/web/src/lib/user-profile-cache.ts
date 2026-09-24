import { Schema } from "effect";

const USER_PROFILE_CACHE_KEY = "shiftly:user-profile";

const CachedUserProfile = Schema.Struct({
	name: Schema.String,
	image: Schema.NullOr(Schema.String),
});

export type CachedUserProfile = typeof CachedUserProfile.Type;

export function readCachedUserProfile(): CachedUserProfile | null {
	try {
		const raw = localStorage.getItem(USER_PROFILE_CACHE_KEY);
		if (!raw) return null;
		return Schema.decodeUnknownSync(CachedUserProfile)(JSON.parse(raw));
	} catch {
		return null;
	}
}

export function writeCachedUserProfile(profile: CachedUserProfile): void {
	try {
		localStorage.setItem(USER_PROFILE_CACHE_KEY, JSON.stringify(profile));
	} catch (error) {
		console.warn("Unable to cache the user profile for offline use.", error);
	}
}

export function clearCachedUserProfile(): void {
	try {
		localStorage.removeItem(USER_PROFILE_CACHE_KEY);
	} catch (error) {
		console.warn("Unable to clear the cached user profile.", error);
	}
}
