import { HttpRouter, HttpServerResponse } from "@effect/platform";
import { HealthResponse } from "@workspace/api";

export const healthRoutes = HttpRouter.empty.pipe(
	HttpRouter.get(
		"/health",
		HttpServerResponse.schemaJson(HealthResponse)({
			status: "ok",
			timestamp: new Date().toISOString(),
		}),
	),
);
