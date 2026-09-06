import { Schema } from "effect";

export const User = Schema.Struct({
	name: Schema.String,
	email: Schema.optional(Schema.String),
	password: Schema.String,
});
export type User = typeof User.Type;
