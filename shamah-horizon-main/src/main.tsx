import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { toast } from "@/components/ui/use-toast";
import { ToastAction } from "@/components/ui/toast";
import * as React from "react";

// eslint-disable-next-line no-console
console.log("main.tsx loaded");

try {
	const root = createRoot(document.getElementById("root")!);
	root.render(<App />);

		// Dev safety: unregister any previously-installed service workers and clear caches.
		// This prevents stale SW caching and errors like "Response body is already used" from impacting local dev.
		if (import.meta.env.DEV && "serviceWorker" in navigator) {
			navigator.serviceWorker.getRegistrations().then((regs) => {
				regs.forEach((r) => r.unregister());
			});
			if ("caches" in window) {
				caches.keys().then((keys) => keys.forEach((k) => caches.delete(k)));
			}
		}

	 // Register service worker for PWA functionality and handle updates.
	// IMPORTANT: avoid registering SW during development to prevent caching/blank-page issues.
	 if (import.meta.env.PROD && "serviceWorker" in navigator) {
		window.addEventListener("load", () => {
			navigator.serviceWorker
				.register("/sw.js")
				.then((reg) => {
					const showUpdateToast = (registration: ServiceWorkerRegistration) => {
						const waiting = registration.waiting;
						if (!waiting) return;

						const reload = async () => {
							try {
								waiting.postMessage({ type: "SKIP_WAITING" });
							} catch (err) {
								// eslint-disable-next-line no-console
								console.warn("Failed to message SW:", err);
							}
						};

						toast({
							title: "Update available",
							description: "A new version is ready.",
							action: (
								<ToastAction asChild altText="Reload to update">
									<button onClick={() => reload()}>Reload</button>
								</ToastAction>
							),
						});
					};

					if (reg.waiting) {
						showUpdateToast(reg);
					}

					reg.addEventListener("updatefound", () => {
						const newWorker = reg.installing;
						if (!newWorker) return;
						newWorker.addEventListener("statechange", () => {
							if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
								showUpdateToast(reg);
							}
						});
					});

					navigator.serviceWorker.addEventListener("controllerchange", () => {
						window.location.reload();
					});
				})
				.catch((err) => {
					// eslint-disable-next-line no-console
					console.warn("Service Worker registration failed:", err);
				});
		});
	}
} catch (err) {
	// eslint-disable-next-line no-console
	console.error("Error mounting React app:", err);
	const el = document.getElementById("root");
	if (el) el.innerHTML = `<pre style="color:red; padding:20px;">Error mounting app:\n${String(err)}</pre>`;
}
