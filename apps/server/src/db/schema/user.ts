import { relations, sql } from "drizzle-orm";
import { pgTable, text, unique, uuid, varchar } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.ts";
import { daySchedules } from "./schedule.ts";

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		name: varchar("name", { length: 100 }).notNull(),
		username: varchar("username", { length: 30 }).notNull(),
		email: varchar("email", { length: 254 }),
		password: text("password").notNull(),
		...timestamps,
	},
	(table) => [
		unique("users_username_unique").on(table.username),
		unique("users_email_unique").on(table.email),
	],
);

export const usersRelations = relations(users, ({ many }) => ({
	daySchedules: many(daySchedules),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
