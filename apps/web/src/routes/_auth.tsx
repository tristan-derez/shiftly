import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: ({ context }) => {
		if (!context.authData?.user) {
			throw redirect({ to: "/signin" });
		}
	},
});

function AuthLayout() {
	return <Outlet />;
}
