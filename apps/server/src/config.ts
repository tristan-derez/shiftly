import { Config, Effect } from "effect";

export class AppConfig extends Effect.Service<AppConfig>()(
	"shiftly/AppConfig",
	{
		effect: Effect.gen(function* () {
			const port = yield* Config.integer("PORT").pipe(Config.withDefault(3000));
			const host = yield* Config.string("HOST").pipe(
				Config.withDefault("localhost"),
			);
			const databaseUrl = yield* Config.redacted("DATABASE_URL");
			const pepperKey = yield* Config.redacted("PEPPER_KEY");
			const betterAuthUrl = yield* Config.string("BETTER_AUTH_URL");
			const betterAuthSecret = yield* Config.redacted("BETTER_AUTH_SECRET");
			const clientUrl = yield* Config.string("CLIENT_URL");

			return {
				port,
				host,
				databaseUrl,
				pepperKey,
				betterAuthUrl,
				betterAuthSecret,
				clientUrl,
			};
		}),
	},
) {}
