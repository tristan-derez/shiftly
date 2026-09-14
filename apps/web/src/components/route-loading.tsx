import { SpinnerIcon } from "@phosphor-icons/react";

export const RouteLoading = () => {
	return (
		<div
			className="fixed inset-0 flex items-center justify-center text-primary"
			role="status"
		>
			<SpinnerIcon className="size-10 animate-spin" aria-label="Loading" />
		</div>
	);
};
