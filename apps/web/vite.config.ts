import tailwindcss from "@tailwindcss/vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

// https://vite.dev/config/
export default defineConfig({
	plugins: [
		tanstackRouter({
			target: "react",
			autoCodeSplitting: true,
		}),
		react(),
		tailwindcss(),
		VitePWA({
			registerType: "autoUpdate",
			manifest: false,
			includeAssets: [
				"manifest.webmanifest",
				"shiflty-logo.svg",
				"shiftly-full-logo.svg",
				"icons/icon-192.png",
				"icons/icon-512.png",
				"icons/icon-maskable-192.png",
				"icons/icon-maskable-512.png",
				"icons/apple-touch-icon.png",
			],
			workbox: {
				globPatterns: [
					"**/*.{js,css,html,svg,png,webmanifest,woff2}",
				],
				navigateFallback: "index.html",
				navigateFallbackDenylist: [/^\/api\//],
			},
		}),
	],
	resolve: {
		alias: {
			"@": path.resolve(import.meta.dirname, "./src"),
		},
	},
});
