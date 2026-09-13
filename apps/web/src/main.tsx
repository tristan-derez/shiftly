import { StrictMode } from "react";

import "@workspace/ui/globals.css";

import { createRouter, RouterProvider } from "@tanstack/react-router";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { authClient } from "@/lib/auth-client";

import { routeTree } from "./routeTree.gen";

const router = createRouter({
	routeTree,
	context: { authData: null },
});

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	const { data: authData, isPending } = authClient.useSession();

	if (isPending) {
		return null;
	}

	return <RouterProvider router={router} context={{ authData }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ThemeProvider>
				<App />
			</ThemeProvider>
		</StrictMode>,
	);
}
