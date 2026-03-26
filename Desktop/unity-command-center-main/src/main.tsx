import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ReactQueryProvider } from "@/lib/queryClient";

createRoot(document.getElementById("root")!).render(
	<ReactQueryProvider>
		<App />
	</ReactQueryProvider>
);

// Register simple service worker for PWA offline support
if ('serviceWorker' in navigator) {
	window.addEventListener('load', () => {
		navigator.serviceWorker.register('/sw.js').then((reg) => {
			console.log('Service worker registered', reg.scope);
		}).catch((err) => console.warn('SW registration failed', err));
	});
}
