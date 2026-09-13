import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Nav } from "@/components/nav";
import type { AuthSession } from "@/lib/auth-client";

interface RouterContext {
	authData: AuthSession;
}

const RootLayout = () => (
	<div className="max-w-270 mx-auto">
		<Nav />
		<div className="px-2 pt-8 lg:pt-20">
			<Outlet />
		</div>
		<TanStackRouterDevtools />
	</div>
);

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});
