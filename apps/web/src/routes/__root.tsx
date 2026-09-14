import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Nav } from "@/components/nav";
import { NotFound } from "@/components/not-found";
import { RouteLoading } from "@/components/route-loading";
import { type AuthSession, fetchSession } from "@/lib/auth-client";

interface RouterContext {
	authData: AuthSession;
}

const RootLayout = () => {
	return (
		<div className="flex min-h-svh flex-col px-3 lg:px-0 lg:mx-auto max-w-5xl">
			<Nav />
			<div className="flex flex-1 flex-col gap-2">
				<Outlet />
			</div>
			<TanStackRouterDevtools />
		</div>
	);
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
	beforeLoad: async () => {
		const authData = await fetchSession();
		return { authData };
	},
	pendingComponent: RouteLoading,
	notFoundComponent: NotFound,
});
