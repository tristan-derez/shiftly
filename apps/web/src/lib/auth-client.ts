import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import {
	clearCachedUserProfile,
	writeCachedUserProfile,
} from "@/lib/user-profile-cache";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:3008",
	plugins: [usernameClient({ displayUsername: false })],
});

export type AuthSession = ReturnType<typeof authClient.useSession>["data"];

let cachedSessionPromise: Promise<AuthSession> | null = null;
let sessionRequestFailed = false;

export function fetchSession(): Promise<AuthSession> {
	if (!cachedSessionPromise) {
		cachedSessionPromise = authClient
			.getSession()
			.then(({ data, error }) => {
				if (error) {
					sessionRequestFailed = true;
					cachedSessionPromise = null;
					return null;
				}

				sessionRequestFailed = false;
				if (data) {
					writeCachedUserProfile({
						name: data.user.name,
						image: data.user.image ?? null,
					});
				} else if (!error) {
					clearCachedUserProfile();
				}
				return data ?? null;
			})
			.catch(() => {
				sessionRequestFailed = true;
				cachedSessionPromise = null;
				return null;
			});
	}
	return cachedSessionPromise;
}

export function didSessionRequestFail(): boolean {
	return sessionRequestFailed;
}

export function invalidateSessionCache(): void {
	cachedSessionPromise = null;
	sessionRequestFailed = false;
}

export function setSessionCache(session: AuthSession): void {
	sessionRequestFailed = false;
	cachedSessionPromise = Promise.resolve(session);
	if (session) {
		writeCachedUserProfile({
			name: session.user.name,
			image: session.user.image ?? null,
		});
	} else {
		clearCachedUserProfile();
	}
}

export async function refreshSession(): Promise<AuthSession> {
	invalidateSessionCache();
	return fetchSession();
}
