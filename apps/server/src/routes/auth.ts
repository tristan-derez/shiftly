import {
	HttpRouter,
	HttpServerRequest,
	HttpServerResponse,
} from "@effect/platform";
import { Effect } from "effect";
import { AuthService } from "../auth.ts";

export const authRoutes = HttpRouter.empty.pipe(
	HttpRouter.all(
		"/api/auth/*",
		Effect.gen(function* () {
			const authService = yield* AuthService;
			const request = yield* HttpServerRequest.HttpServerRequest;
			const webRequest = yield* HttpServerRequest.toWeb(request);
			const response = yield* Effect.tryPromise({
				try: () => authService.auth.handler(webRequest),
				catch: (cause) => cause,
			});
			return HttpServerResponse.fromWeb(response);
		}).pipe(
			Effect.catchAll((error) =>
				Effect.logError("Failed to handle auth request", error).pipe(
					Effect.as(
						HttpServerResponse.unsafeJson(
							{ message: "Internal Server Error" },
							{ status: 500 },
						),
					),
				),
			),
		),
	),
);
