import { createRootRouteWithContext, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Toaster } from "@workspace/ui/components/toast";
import { cn } from "@workspace/ui/lib/utils";
import { Nav } from "@/components/nav";
import type { AuthSession } from "@/lib/auth-client";

interface RouterContext {
	authData: AuthSession;
}

const RootLayout = () => {
	const { authData } = Route.useRouteContext();

	return (
		<div className="max-w-270 mx-auto">
			<Nav />
			<div className={cn("px-2", authData && "pt-8 lg:pt-20")}>
				<Outlet />
				<Toaster />
			</div>
			<TanStackRouterDevtools />
		</div>
	);
};

export const Route = createRootRouteWithContext<RouterContext>()({
	component: RootLayout,
});
