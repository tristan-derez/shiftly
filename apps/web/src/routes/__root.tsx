import { createRootRoute, Outlet } from "@tanstack/react-router";
import { TanStackRouterDevtools } from "@tanstack/react-router-devtools";
import { Nav } from "@/components/nav";

const RootLayout = () => (
	<div className="max-w-270 mx-auto">
		<Nav />
		<div className="px-2 pt-8 lg:pt-20">
			<Outlet />
		</div>
		<TanStackRouterDevtools />
	</div>
);

export const Route = createRootRoute({ component: RootLayout });
