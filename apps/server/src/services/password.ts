import { createHmac } from "node:crypto";
import { hash as argon2Hash, verify as argon2Verify } from "@node-rs/argon2";
import { Data, Effect, Redacted } from "effect";
import { AppConfig } from "../config.ts";

export class PasswordHashError extends Data.TaggedError("PasswordHashError")<{
	cause: unknown;
}> {}

export class MalformedHashError extends Data.TaggedError("MalformedHashError")<{
	cause: unknown;
}> {}

const ARGON2_OPTIONS = {
	memoryCost: 19 * 1024,
	timeCost: 4,
	parallelism: 2,
	algorithm: 2, // Algorithm.Argon2id
} as const;

export class PasswordService extends Effect.Service<PasswordService>()(
	"shiftly/PasswordService",
	{
		effect: Effect.gen(function* () {
			const config = yield* AppConfig;

			const applyPepper = (password: Redacted.Redacted<string>): string => {
				const hasher = createHmac("sha256", Redacted.value(config.pepperKey));
				hasher.update(Redacted.value(password));
				return hasher.digest("hex");
			};

			const hash = (args: {
				password: Redacted.Redacted<string>;
			}): Effect.Effect<string, PasswordHashError> =>
				Effect.tryPromise({
					try: () => argon2Hash(applyPepper(args.password), ARGON2_OPTIONS),
					catch: (cause) => new PasswordHashError({ cause }),
				});

			const verify = (args: {
				hash: string;
				password: Redacted.Redacted<string>;
			}): Effect.Effect<boolean, MalformedHashError> =>
				Effect.tryPromise({
					try: () => argon2Verify(args.hash, applyPepper(args.password)),
					catch: (cause) => new MalformedHashError({ cause }),
				});

			return { hash, verify };
		}),
		dependencies: [AppConfig.Default],
	},
) {}
