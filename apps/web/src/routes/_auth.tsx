import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/_auth")({
	component: AuthLayout,
	beforeLoad: async ({ context }) => {
		if (!context.authData?.user) {
			throw redirect({ to: "/signin" });
		}
		return { user: context.authData.user };
	},
});

function AuthLayout() {
	return <Outlet />;
}
