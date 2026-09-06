import { Config, Effect } from "effect";

export class AppConfig extends Effect.Service<AppConfig>()(
	"shiftly/AppConfig",
	{
		effect: Effect.gen(function* () {
			const port = yield* Config.integer("PORT").pipe(Config.withDefault(3000));
			const host = yield* Config.string("HOST").pipe(
				Config.withDefault("localhost"),
			);
			const databaseUrl = yield* Config.string("DATABASE_URL");
			return { port, host, databaseUrl };
		}),
	},
) {}
