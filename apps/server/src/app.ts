import { HttpRouter } from "@effect/platform";
import { authRoutes } from "./routes/auth.ts";
import { healthRoutes } from "./routes/health.ts";
import { scheduleRoutes } from "./routes/schedule.ts";

export const app = HttpRouter.empty.pipe(
	HttpRouter.concat(authRoutes),
	HttpRouter.concat(healthRoutes),
	HttpRouter.concat(scheduleRoutes),
);
