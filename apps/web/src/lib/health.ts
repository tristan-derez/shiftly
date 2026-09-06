import { HealthResponse } from "@workspace/api";
import { Schema } from "effect";

const parse = Schema.decodeUnknownSync(HealthResponse);

export const fetchHealth = (): Promise<HealthResponse> =>
	fetch("/api/health")
		.then((response) => response.json())
		.then(parse);
