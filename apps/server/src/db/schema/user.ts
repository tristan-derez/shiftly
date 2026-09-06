import { relations, sql } from "drizzle-orm";
import { pgTable, text, unique, uuid } from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.ts";
import { daySchedules, shifts } from "./schedule.ts";

export const users = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		name: text("name").notNull(),
		username: text("username").notNull(),
		email: text("email"),
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
	shifts: many(shifts),
}));

export type UserRow = typeof users.$inferSelect;
export type NewUserRow = typeof users.$inferInsert;
