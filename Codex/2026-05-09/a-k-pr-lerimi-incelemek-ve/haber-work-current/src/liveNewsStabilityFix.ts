const SONARAT_REFRESH_INTERVAL_MS = 60000;
const SONARAT_FAKE_LIVE_INTERVAL_MS = 25000;
const SONARAT_NATIVE_REFRESH_INTERVAL_MS = 120000;

declare global {
  interface Window {
    __sonaratLiveNewsPatch?: boolean;
  }
}

function isNewsApiUrl(input: RequestInfo | URL) {
  try {
    const rawUrl =
      typeof input === "string" || input instanceof URL
        ? input.toString()
        : input.url;
    const url = new URL(rawUrl, window.location.origin);
    return url.pathname === "/api/news";
  } catch {
    return false;
  }
}

function freshNewsUrl(input: RequestInfo | URL) {
  const rawUrl =
    typeof input === "string" || input instanceof URL
      ? input.toString()
      : input.url;
  const url = new URL(rawUrl, window.location.origin);
  url.searchParams.set("ts", Date.now().toString());
  return url.pathname + url.search + url.hash;
}

if (typeof window !== "undefined" && !window.__sonaratLiveNewsPatch) {
  window.__sonaratLiveNewsPatch = true;

  const nativeFetch = window.fetch.bind(window);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
    if (!isNewsApiUrl(input)) return nativeFetch(input, init);

    const headers = new Headers(init?.headers);
    headers.set("Cache-Control", "no-cache");

    return nativeFetch(freshNewsUrl(input), {
      ...init,
      cache: "no-store",
      headers,
    });
  }) as typeof window.fetch;

  const nativeSetInterval = window.setInterval.bind(window);
  window.setInterval = ((handler: TimerHandler, timeout?: number, ...args: unknown[]) => {
    if (timeout === SONARAT_FAKE_LIVE_INTERVAL_MS) {
      return nativeSetInterval(() => undefined, 2147483647);
    }

    const nextTimeout =
      timeout === SONARAT_NATIVE_REFRESH_INTERVAL_MS
        ? SONARAT_REFRESH_INTERVAL_MS
        : timeout;

    return nativeSetInterval(handler, nextTimeout, ...args);
  }) as typeof window.setInterval;
}

export {};
