import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema/index.ts";

export type DatabaseClient = ReturnType<typeof createDatabaseClient>;

export const createDatabaseClient = (databaseUrl: string) =>
	drizzle(postgres(databaseUrl), { schema });
