import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.api-cache.json');
const CACHE_TTL = 1000 * 60 * 5; // 5 minutes cache

interface CacheEntry {
    data: string;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    timestamp: number;
}

function serverLog(message: string) {
    if (typeof process !== 'undefined' && process.stdout) {
        process.stdout.write(message + '\n');
    } else {
        console.log(message);
    }
}

function loadCache(): Record<string, CacheEntry> {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const content = fs.readFileSync(CACHE_FILE, 'utf-8');
            return JSON.parse(content);
        }
    } catch (e: any) {
        serverLog(`[API Cache] Load failed: ${e?.message || e}`);
    }
    return {};
}

function saveCache(cache: Record<string, CacheEntry>) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    } catch (e: any) {
        serverLog(`[API Cache] Save failed: ${e?.message || e}`);
    }
}

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3): Promise<Response> {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';
    
    if (isGet) {
        const cache = loadCache();
        const cached = cache[url];
        // If we have a cached version and it's within the TTL, use it immediately
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            serverLog(`[API] Serving cached response (Fresh): ${url}`);
            return new Response(cached.data, {
                status: cached.status,
                statusText: cached.statusText,
                headers: {
                    ...cached.headers,
                    'X-Cache': 'HIT-FRESH'
                }
            });
        }
    }

    let lastResponse: Response | null = null;
    let lastError: any = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
        try {
            if (attempt > 0) {
                const delay = 500 * attempt;
                serverLog(`[API] Retrying request to ${url}. Attempt ${attempt} of ${maxRetries} after ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const response = await fetch(url, options);
            
            // Check for rate limit (429) or server errors (5xx)
            if (response.status === 429) {
                serverLog(`[API] 429 Rate Limited on ${url}.`);
                lastResponse = response;
                lastError = new Error(`HTTP 429: Too Many Requests`);
                continue;
            }

            if (response.status >= 500) {
                serverLog(`[API] Server Error ${response.status} on ${url}.`);
                lastResponse = response;
                lastError = new Error(`HTTP ${response.status}: Server Error`);
                continue;
            }

            // Success! Cache GET responses
            if (isGet && response.status === 200) {
                try {
                    const cloned = response.clone();
                    const text = await cloned.text();
                    
                    // Basic validation to ensure it's valid JSON if requested as such
                    let isValid = true;
                    try {
                        JSON.parse(text);
                    } catch {
                        isValid = false;
                    }

                    if (isValid) {
                        const cache = loadCache();
                        const headersObj: Record<string, string> = {};
                        response.headers.forEach((value, key) => {
                            headersObj[key] = value;
                        });

                        cache[url] = {
                            data: text,
                            status: response.status,
                            statusText: response.statusText,
                            headers: headersObj,
                            timestamp: Date.now()
                        };
                        saveCache(cache);
                        serverLog(`[API] Successfully cached fresh response for ${url}`);
                    }
                } catch (e: any) {
                    serverLog(`[API Cache] Failed to cache response: ${e?.message || e}`);
                }
            }

            return response;
        } catch (err: any) {
            serverLog(`[API] Network error fetching ${url}: ${err?.message || err}`);
            lastError = err;
        }
    }

    serverLog(`[API] All ${maxRetries} retries exhausted for ${url}. Error: ${lastError?.message || lastError}`);

    // STALE FALLBACK: If API fails, check if we have any stale cache (even expired)
    if (isGet) {
        const cache = loadCache();
        const cached = cache[url];
        if (cached) {
            serverLog(`[API] Serving fallback STALE cached response: ${url}`);
            return new Response(cached.data, {
                status: cached.status,
                statusText: cached.statusText,
                headers: {
                    ...cached.headers,
                    'X-Cache': 'HIT-STALE'
                }
            });
        }
    }

    // Return a mock response that matches Response interface to avoid server crashes (especially JSON decoding errors on 429/5xx HTML pages)
    return {
        ok: false,
        status: lastResponse ? lastResponse.status : 503,
        statusText: lastResponse ? lastResponse.statusText : "Service Unavailable",
        json: async () => [],
        text: async () => "Service Unavailable",
        headers: new Headers(),
    } as unknown as Response;
}

export default function api() {
    const apiUrl = process.env.NEXT_OPENF1_API_URL
    if (!apiUrl) {
        throw new Error('NEXT_OPENF1_API_URL is not defined')
    }
    return {
        get: (url: string) => fetchWithRetry(`${apiUrl}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        post: (url: string, body: unknown) => fetchWithRetry(`${apiUrl}${url}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}