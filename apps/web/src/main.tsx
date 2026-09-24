import { StrictMode } from "react";
import "@workspace/ui/globals.css";
import { registerSW } from "virtual:pwa-register";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createRouter, RouterProvider } from "@tanstack/react-router";
import { Toaster } from "@workspace/ui/components/toast";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@/components/theme-provider.tsx";
import { routeTree } from "./routeTree.gen";

registerSW({ immediate: true });

const router = createRouter({
	routeTree,
	context: { authData: null },
	defaultPreload: "intent",
	defaultPreloadStaleTime: 30_000,
	defaultPendingMs: 200,
	defaultPendingMinMs: 200,
});

const queryClient = new QueryClient();

declare module "@tanstack/react-router" {
	interface Register {
		router: typeof router;
	}
}

function App() {
	return <RouterProvider router={router} context={{ authData: null }} />;
}

const rootElement = document.getElementById("root")!;
if (!rootElement.innerHTML) {
	const root = ReactDOM.createRoot(rootElement);
	root.render(
		<StrictMode>
			<ThemeProvider>
				<QueryClientProvider client={queryClient}>
					<App />
				</QueryClientProvider>
				<Toaster />
			</ThemeProvider>
		</StrictMode>,
	);
}
