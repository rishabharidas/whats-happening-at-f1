// Global queue for sequentializing requests to the F1 API
let requestQueue: Promise<unknown> = Promise.resolve();

export default function api() {
  const apiUrl = process.env.NEXT_OPENF1_API_URL;
  if (!apiUrl) {
    throw new Error("NEXT_OPENF1_API_URL is not defined");
  }

  const base = apiUrl.endsWith("/") ? apiUrl.slice(0, -1) : apiUrl;

  const fetchWithRetry = async (
    url: string,
    options: RequestInit,
    retries = 3,
  ): Promise<Response> => {
    const cleanUrl = url.replace(/^\/+/, "");
    const target = `${base}/${cleanUrl}`;

    // 1. Capture the current queue tail and synchronously append a new link to it.
    // This stops other simultaneous calls from stepping on each other's toes.
    const currentQueue = requestQueue;
    let resolveQueue: () => void = () => {};

    requestQueue = currentQueue.then(() => {
      return new Promise<void>((resolve) => {
        resolveQueue = resolve;
      });
    });

    // 2. Wait for all preceding requests in the queue to completely finish
    await currentQueue;

    try {
      for (let attempt = 0; attempt <= retries; attempt++) {
        if (attempt > 0) {
          const delay = 1500 * attempt; // Slightly longer backoff for 429 recoveries
          console.log(
            `[API] Retrying request to ${target}. Attempt ${attempt} of ${retries} after ${delay}ms...`,
          );
          await new Promise((resolve) => setTimeout(resolve, delay));
        }

        try {
          const res = await fetch(target, {
            ...options,
            next: { revalidate: 300 }, // 5 minutes cache
          });

          // If we get rate-limited, don't return early; loop back and retry
          if (res.status === 429 || res.status >= 500) {
            console.warn(`[API] ${res.status} error on ${target}.`);
            if (attempt === retries) break;
            continue;
          }

          return res;
        } catch (err: any) {
          console.error(
            `[API] Network failure on ${target}:`,
            err?.message || err,
          );
          if (attempt === retries) break;
        }
      }

      // Fallback response if all retries completely fail
      return { ok: false, json: async () => [] } as unknown as Response;
    } finally {
      // 3. Critically important: ALWAYS release the queue block,
      // and give the API a tiny 250ms breathing room before the next task runs.
      setTimeout(() => resolveQueue(), 250);
    }
  };

  return {
    get: (url: string) =>
      fetchWithRetry(url, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }),
    post: (url: string, body: unknown) =>
      fetchWithRetry(url, {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
  };
}
