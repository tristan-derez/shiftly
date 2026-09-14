import { HealthResponse } from "@workspace/api";
import { Schema } from "effect";

const parse = Schema.decodeUnknownSync(HealthResponse);

export const fetchHealth = (): Promise<HealthResponse> =>
	fetch(
		`${import.meta.env.VITE_BETTER_AUTH_URL ?? "http://localhost:3000"}/health`,
	)
		.then((response) => response.json())
		.then(parse);
