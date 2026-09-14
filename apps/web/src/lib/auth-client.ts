import { usernameClient } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
	baseURL: import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:3008",
	plugins: [usernameClient({ displayUsername: false })],
});

export type AuthSession = ReturnType<typeof authClient.useSession>["data"];

let cachedSessionPromise: Promise<AuthSession> | null = null;

export function fetchSession(): Promise<AuthSession> {
	if (!cachedSessionPromise) {
		cachedSessionPromise = authClient
			.getSession()
			.then(({ data }) => data ?? null)
			.catch(() => {
				cachedSessionPromise = null;
				return null;
			});
	}
	return cachedSessionPromise;
}

export function invalidateSessionCache(): void {
	cachedSessionPromise = null;
}

export function setSessionCache(session: AuthSession): void {
	cachedSessionPromise = Promise.resolve(session);
}

export async function refreshSession(): Promise<AuthSession> {
	invalidateSessionCache();
	return fetchSession();
}
