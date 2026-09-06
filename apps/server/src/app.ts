import { HttpRouter } from "@effect/platform";
import { healthRoutes } from "./routes/health.ts";

export const app = HttpRouter.empty.pipe(HttpRouter.concat(healthRoutes));
