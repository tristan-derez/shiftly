import { HttpRouter } from "@effect/platform";
import { authRoutes } from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";

export const app = HttpRouter.empty.pipe(
	HttpRouter.concat(authRoutes),
	HttpRouter.concat(healthRoutes),
);
