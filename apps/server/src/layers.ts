import { createServer } from "node:http";
import { HttpServer } from "@effect/platform";
import { NodeHttpServer } from "@effect/platform-node";
import { Effect, Layer } from "effect";
import { app } from "./app.ts";
import { AuthService } from "./auth.ts";
import { AppConfig } from "./config.ts";
import { DotEnvConfig } from "./env.ts";
import { DatabaseService } from "./services/database.ts";
import { PasswordService } from "./services/password.ts";

export const HttpLive = HttpServer.serve(app).pipe(
	HttpServer.withLogAddress,
	Layer.provide(
		Layer.unwrapEffect(
			Effect.map(AppConfig, (config) =>
				NodeHttpServer.layer(createServer, {
					port: config.port,
					host: config.host,
				}),
			),
		),
	),
	Layer.provide(AppConfig.Default),
	Layer.provide(DatabaseService.Default),
	Layer.provide(PasswordService.Default),
	Layer.provide(AuthService.Default),
	Layer.provide(DotEnvConfig),
);
