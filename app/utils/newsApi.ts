import fs from 'fs';
import path from 'path';

const CACHE_FILE = path.join(process.cwd(), '.api-cache.json');
const CACHE_TTL = 1000 * 60 * 15; // 15 minutes cache for NewsAPI to avoid limit exhaust

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
        serverLog(`[NewsAPI Cache] Load failed: ${e?.message || e}`);
    }
    return {};
}

function saveCache(cache: Record<string, CacheEntry>) {
    try {
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2), 'utf-8');
    } catch (e: any) {
        serverLog(`[NewsAPI Cache] Save failed: ${e?.message || e}`);
    }
}

// Solid F1 Mock news articles to serve as a robust fallback
const MOCK_NEWS_ARTICLES = {
    status: "ok",
    totalResults: 0,
    articles: [
        // {
        //     source: { name: "Formula 1" },
        //     author: "Paddock Insider",
        //     title: "Hamilton vs Verstappen: The Strategic Duel That Defined the GP",
        //     description: "An in-depth analysis of the tire management and pit-stop strategies that decided the latest Formula 1 clash on track.",
        //     url: "https://www.formula1.com",
        //     urlToImage: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=800",
        //     publishedAt: new Date(Date.now() - 3600000).toISOString(),
        //     content: "The latest Grand Prix delivered one of the most intense tactical battles of the season. Under extreme temperatures, tires degraded faster than expected, forcing teams into splits..."
        // },
        // {
        //     source: { name: "Autosport" },
        //     author: "Rebecca Meade",
        //     title: "Ferrari Teases Major Floor and Wing Upgrades for Upcoming European Leg",
        //     description: "Team Principal reveals that CFD and wind-tunnel simulations show promising gains for the Scuderia's upcoming aerodynamic package.",
        //     url: "https://www.autosport.com",
        //     urlToImage: "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&q=80&w=800",
        //     publishedAt: new Date(Date.now() - 14400000).toISOString(),
        //     content: "Ferrari's technical team has been working around the clock to address high-speed balance issues. The new floor update, scheduled for debut next weekend, focuses on..."
        // },
        // {
        //     source: { name: "Motorsport.com" },
        //     author: "Jonathan Noble",
        //     title: "How Mid-Field Teams Are Exploiting Alternative Setups to Outqualify Rivals",
        //     description: "Exploring the suspension geometry tweaks and rake adjustments keeping smaller teams in the top ten fight.",
        //     url: "https://www.motorsport.com",
        //     urlToImage: "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&q=80&w=800",
        //     publishedAt: new Date(Date.now() - 28800000).toISOString(),
        //     content: "With the grid tighter than ever, finding even half a tenth in qualifying makes the difference between starting P8 or P14. Engineers are turning to aggressive setups..."
        // },
        // {
        //     source: { name: "ESPN F1" },
        //     author: "Nate Saunders",
        //     title: "Aston Martin Confirms Long-Term High-Tech Simulation Center Expansion",
        //     description: "The Silverstone squad doubles down on infrastructure with a state-of-the-art simulator to accelerate in-season driver development.",
        //     url: "https://www.espn.com/f1",
        //     urlToImage: "https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&q=80&w=800",
        //     publishedAt: new Date(Date.now() - 43200000).toISOString(),
        //     content: "Aston Martin is continuing its relentless push towards championship contention. The team has officially broken ground on the second phase of its campus expansion..."
        // },
        // {
        //     source: { name: "The Race" },
        //     author: "Mark Hughes",
        //     title: "The Quiet Evolution Behind McLaren's Remarkable High-Speed Cornering Balance",
        //     description: "Analysing how McLaren solved their drag problem while maintaining their legendary stability in fast sweepers.",
        //     url: "https://the-race.com",
        //     urlToImage: "https://images.unsplash.com/photo-1610969524113-bae462bb3882?auto=format&fit=crop&q=80&w=800",
        //     publishedAt: new Date(Date.now() - 86400000).toISOString(),
        //     content: "McLaren's turnaround over the last 18 months has been well documented, but the subtle aerodynamical refinements to their sidepod inlets show a team in supreme command..."
        // }
    ]
};

async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 2): Promise<Response> {
    const isGet = !options.method || options.method.toUpperCase() === 'GET';

    if (isGet) {
        const cache = loadCache();
        const cached = cache[url];
        // If we have a cached version and it's within the TTL, use it immediately
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            serverLog(`[NewsAPI] Serving cached response (Fresh): ${url}`);
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
                const delay = 1000 * attempt;
                serverLog(`[NewsAPI] Retrying request to ${url}. Attempt ${attempt} of ${maxRetries} after ${delay}ms...`);
                await new Promise((resolve) => setTimeout(resolve, delay));
            }

            const response = await fetch(url, options);

            // Check for rate limit (429) or server errors (5xx/403 for unauthorized keys)
            if (response.status === 429) {
                serverLog(`[NewsAPI] 429 Rate Limited on ${url}.`);
                lastResponse = response;
                lastError = new Error(`HTTP 429: Too Many Requests`);
                continue;
            }

            if (response.status === 403 || response.status === 401) {
                serverLog(`[NewsAPI] Authentication Error ${response.status} on ${url}. Checking keys.`);
                lastResponse = response;
                lastError = new Error(`HTTP ${response.status}: API Key Issue`);
                break; // Don't retry auth errors
            }

            if (response.status >= 500) {
                serverLog(`[NewsAPI] Server Error ${response.status} on ${url}.`);
                lastResponse = response;
                lastError = new Error(`HTTP ${response.status}: Server Error`);
                continue;
            }

            // Success! Cache GET responses
            if (isGet && response.status === 200) {
                try {
                    const cloned = response.clone();
                    const text = await cloned.text();

                    // Basic validation to ensure it's valid JSON
                    let isValid = true;
                    try {
                        const parsed = JSON.parse(text);
                        // If NewsAPI returned status error inside a 200 OK body
                        if (parsed.status === "error") {
                            isValid = false;
                            serverLog(`[NewsAPI] Internal error body returned from 200 response: ${parsed.message}`);
                        }
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
                        serverLog(`[NewsAPI] Successfully cached fresh response for ${url}`);
                    }
                } catch (e: any) {
                    serverLog(`[NewsAPI Cache] Failed to cache response: ${e?.message || e}`);
                }
            }

            return response;
        } catch (err: any) {
            serverLog(`[NewsAPI] Network error fetching ${url}: ${err?.message || err}`);
            lastError = err;
        }
    }

    serverLog(`[NewsAPI] All ${maxRetries} retries exhausted for ${url}. Error: ${lastError?.message || lastError}`);

    // STALE FALLBACK: If API fails, check if we have any stale cache (even expired)
    if (isGet) {
        const cache = loadCache();
        const cached = cache[url];
        if (cached) {
            serverLog(`[NewsAPI] Serving fallback STALE cached response: ${url}`);
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

    // fallback to Mock articles response
    serverLog(`[NewsAPI] Serving fallback hardcoded static F1 mock news data.`);
    return new Response(JSON.stringify(MOCK_NEWS_ARTICLES), {
        status: 200,
        statusText: "OK",
        headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT-MOCK'
        }
    });
}

export default function newsApi() {
    const apiUrl = process.env.NEXT_NEWS_API_URL || 'https://newsapi.org/v2';
    const apiKey = process.env.NEXT_NEWS_API_KEY;

    if (!apiKey) {
        serverLog('[NewsAPI] WARNING: NEXT_NEWS_API_KEY is not defined in environment variables. Falling back to mocks.');
    }

    const getQueryString = (params: Record<string, string>) => {
        const withKey = { ...params, apiKey: apiKey || '' };
        return Object.entries(withKey)
            .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
            .join('&');
    };

    return {
        getF1News: async (pageSize = 12) => {
            if (!apiKey) {
                // Return static mock response directly
                return {
                    ok: true,
                    json: async () => MOCK_NEWS_ARTICLES
                } as unknown as Response;
            }

            // query everything F1
            const params = {
                q: "Formula1",
                language: "en",
                sortBy: "publishedAt",
                pageSize: String(pageSize)
            };

            const fullUrl = `${apiUrl}/everything?${getQueryString(params)}`;
            return fetchWithRetry(fullUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
    };
}
