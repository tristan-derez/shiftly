export interface PostgresErrorInfo {
	code: string;
	detail: string | undefined;
}

export const findPostgresError = (
	error: unknown,
): PostgresErrorInfo | undefined => {
	let current: unknown = error;
	while (typeof current === "object" && current !== null) {
		const candidate = current as {
			code?: unknown;
			detail?: unknown;
			cause?: unknown;
		};

		if (typeof candidate.code === "string") {
			return {
				code: candidate.code,
				detail:
					typeof candidate.detail === "string" ? candidate.detail : undefined,
			};
		}
		current = candidate.cause;
	}
	return undefined;
};
