import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { readCachedSchedule } from "@/lib/schedule-cache";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: ({ context, location }) => {
		const canReadCachedSchedule =
			location.pathname === "/" && readCachedSchedule() !== null;

		if (!context.authData?.user && !canReadCachedSchedule) {
			throw redirect({ to: "/signin" });
		}
	},
});

function AuthLayout() {
	return <Outlet />;
}
