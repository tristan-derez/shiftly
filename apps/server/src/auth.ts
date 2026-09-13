import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { username } from "better-auth/plugins";
import { Context, Data, Effect, Redacted } from "effect";
import { AppConfig } from "./config.ts";
import { authSchema } from "./db/schema/auth.ts";
import { DatabaseService } from "./services/database.ts";
import { PasswordService } from "./services/password.ts";

export interface AuthUser {
	id: string;
	email: string;
	name: string;
	username?: string | null | undefined;
	image?: string | null | undefined;
	emailVerified: boolean;
}

export interface AuthSessionInfo {
	id: string;
	token: string;
	userId: string;
	expiresAt: Date;
	createdAt: Date;
	updatedAt: Date;
	ipAddress?: string | null | undefined;
	userAgent?: string | null | undefined;
}

export interface AuthSessionValue {
	user: AuthUser;
	session: AuthSessionInfo;
}

export class AuthSession extends Context.Tag("shiftly/AuthSession")<
	AuthSession,
	AuthSessionValue
>() {}

export class AuthSessionError extends Data.TaggedError("AuthSessionError")<{
	cause: unknown;
}> {}

export class AuthService extends Effect.Service<AuthService>()(
	"shiftly/AuthService",
	{
		effect: Effect.gen(function* () {
			const config = yield* AppConfig;
			const database = yield* DatabaseService;
			const password = yield* PasswordService;

			const auth = betterAuth({
				baseURL: config.betterAuthUrl,
				secret: Redacted.value(config.betterAuthSecret),
				trustedOrigins: [config.clientUrl],
				database: drizzleAdapter(database.client, {
					provider: "pg",
					schema: authSchema,
				}),
				emailAndPassword: {
					enabled: true,
					requireEmailVerification: false,
					password: {
						hash: (plain) =>
							Effect.runPromise(
								password.hash({ password: Redacted.make(plain) }),
							),
						verify: ({ hash, password: plain }) =>
							Effect.runPromise(
								password.verify({ hash, password: Redacted.make(plain) }),
							),
					},
				},
				plugins: [
					username({
						minUsernameLength: 1,
						maxUsernameLength: 30,
						displayUsername: false,
					}),
				],
				advanced: {
					database: {
						generateId: false,
					},
				},
			});

			return { auth };
		}),
		dependencies: [
			AppConfig.Default,
			DatabaseService.Default,
			PasswordService.Default,
		],
	},
) {}
