// Centralized API helper to keep requests consistent and avoid stale caches.

// Use local backend in development (port 4000), otherwise use a relative path.
// On cPanel, the Node API and static files share the same domain origin.
export const API_BASE_URL = 
  import.meta.env.MODE === "development" ? "http://localhost:4000" : "";

/**
 * Helper to identify if an error is a browser-level network failure.
 */
function isLikelyNetworkError(err: unknown) {
  if (err instanceof TypeError) return true;
  const msg = String((err as any)?.message ?? err);
  return /failed to fetch|networkerror|load failed|fetch failed/i.test(msg);
}

/**
 * Robust JSON fetcher with environment-aware URL construction.
 */
export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const method = String(init?.method || "GET").toUpperCase();
    
    // SAFETY FIX: If API_BASE_URL is empty (production), we must provide 
    // window.location.origin as the base so the URL constructor doesn't throw an error.
    const url = new URL(path, API_BASE_URL || window.location.origin);

    // Extra safety: unique URL for GETs to avoid any stale browser/CDN caching.
    if (method === "GET") {
      url.searchParams.set("_ts", String(Date.now()));
    }

    const headers = new Headers(init?.headers);
    // Explicitly ask server/proxies for the freshest response.
    headers.set("Cache-Control", "no-store");

    const res = await fetch(url.toString(), {
      ...init,
      cache: "no-store", // Browser-level cache directive
      headers,
    });

    if (!res.ok) {
      let details = "";
      try {
        const text = await res.text();
        details = text ? `: ${text}` : "";
      } catch {
        // Fallback if response body isn't readable
      }
      throw new Error(`Request failed (${res.status})${details}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (isLikelyNetworkError(err)) {
      throw new Error("The server is unreachable. Please check your internet connection or verify the server is running.");
    }
    throw err;
  }
}