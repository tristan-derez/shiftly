import {
	HttpApp,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import { Effect } from "effect";
import { AuthService, AuthSession, AuthSessionError } from "../auth.ts";

export const requireAuth = <E, R>(
	httpApp: HttpApp.Default<E, R | AuthSession>,
): HttpApp.Default<E, R | AuthService> =>
	Effect.gen(function* () {
		const authService = yield* AuthService;
		const request = yield* HttpServerRequest.HttpServerRequest;
		const result = yield* Effect.tryPromise({
			try: () => authService.auth.api.getSession({ headers: request.headers }),
			catch: (cause) => new AuthSessionError({ cause }),
		});

		if (!result) {
			return HttpServerResponse.unsafeJson(
				{ message: "Unauthorized" },
				{ status: 401 },
			);
		}

		return yield* httpApp.pipe(
			Effect.provideService(AuthSession, {
				user: result.user,
				session: result.session,
			}),
		);
	}).pipe(
		Effect.catchTag("AuthSessionError", (error) =>
			Effect.logError("Failed to resolve session", error).pipe(
				Effect.as(
					HttpServerResponse.unsafeJson(
						{ message: "Internal Server Error" },
						{ status: 500 },
					),
				),
			),
		),
	);
