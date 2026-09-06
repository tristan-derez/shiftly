import { Schema } from "effect";

export const User = Schema.Struct({
	name: Schema.String.pipe(Schema.maxLength(100)),
	username: Schema.String.pipe(Schema.maxLength(30)),
	email: Schema.optional(Schema.String.pipe(Schema.maxLength(254))),
});

export type User = typeof User.Type;
