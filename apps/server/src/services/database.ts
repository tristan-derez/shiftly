import { Effect } from "effect";
import { AppConfig } from "../config.ts";
import { createDatabaseClient } from "../db/index.ts";

export class DatabaseService extends Effect.Service<DatabaseService>()(
	"shiftly/DatabaseService",
	{
		effect: Effect.gen(function* () {
			const config = yield* AppConfig;
			const client = createDatabaseClient(config.databaseUrl);
			return { client };
		}),
		dependencies: [AppConfig.Default],
	},
) {}
