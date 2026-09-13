import { relations, sql } from "drizzle-orm";
import {
	boolean,
	pgTable,
	text,
	unique,
	uuid,
	varchar,
} from "drizzle-orm/pg-core";
import { timestamps } from "./helpers.ts";
import { daySchedules } from "./schedule.ts";

export const user = pgTable(
	"users",
	{
		id: uuid("id").primaryKey().default(sql`uuidv7()`),
		name: varchar("name", { length: 100 }).notNull(),
		username: varchar("username", { length: 30 }).notNull(),
		email: varchar("email", { length: 254 }),
		emailVerified: boolean("email_verified").notNull().default(false),
		image: text("image"),
		password_hash: text("password_hash"),
		...timestamps,
	},
	(table) => [
		unique("users_username_unique").on(table.username),
		unique("users_email_unique").on(table.email),
	],
);

export const userRelations = relations(user, ({ many }) => ({
	daySchedules: many(daySchedules),
}));

export type UserRow = typeof user.$inferSelect;
export type NewUserRow = typeof user.$inferInsert;
