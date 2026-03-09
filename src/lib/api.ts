// Centralized API helper to keep requests consistent and avoid stale caches.

// Use local backend in development (port 4000), otherwise use configured VITE_API_BASE_URL or relative paths
export const API_BASE_URL =
  (import.meta.env.DEV ? "http://localhost:4000" : (import.meta.env.VITE_API_BASE_URL as string | undefined) || "");

function isLikelyNetworkError(err: unknown) {
  // In browsers, failed network requests often throw TypeError("Failed to fetch").
  if (err instanceof TypeError) return true;
  const msg = String((err as any)?.message ?? err);
  return /failed to fetch|networkerror|load failed|fetch failed/i.test(msg);
}

export async function fetchApiJson<T>(path: string, init?: RequestInit): Promise<T> {
  try {
    const method = String(init?.method || "GET").toUpperCase();
    const url = new URL(`${API_BASE_URL}${path}`);
    // Extra safety: unique URL for GETs to avoid any stale SW/edge caching.
    if (method === "GET") {
      url.searchParams.set("_ts", String(Date.now()));
    }

    const headers = new Headers(init?.headers);
    // Ask intermediaries for the freshest response.
    headers.set("Cache-Control", "no-store");

    const res = await fetch(url.toString(), {
      ...init,
      // Avoid browser/intermediary caching for dynamic content.
      cache: "no-store",
      headers,
    });

    if (!res.ok) {
      let details = "";
      try {
        // Some endpoints may return JSON; avoid throwing if parsing fails.
        const text = await res.text();
        details = text ? `: ${text}` : "";
      } catch {
        // ignore
      }
      throw new Error(`Request failed (${res.status})${details}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (isLikelyNetworkError(err)) {
      throw new Error("You appear to be offline (or the server is unreachable). Please check your internet connection and try again.");
    }
    throw err;
  }
}
