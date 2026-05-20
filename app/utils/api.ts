export default function api() {
    const apiUrl = process.env.NEXT_OPENF1_API_URL
    if (!apiUrl) {
        throw new Error('NEXT_OPENF1_API_URL is not defined')
    }
    
    // Ensure apiUrl doesn't end with a slash for consistent joining
    const base = apiUrl.endsWith('/') ? apiUrl.slice(0, -1) : apiUrl;

    const fetchWithRetry = async (url: string, options: RequestInit, retries = 3): Promise<Response> => {
        // Fix any potential double slashes by cleaning up the URL
        // If url is `/sessions`, path becomes `/sessions`. 
        // If url is `//sessions`, we strip the extra slash.
        const cleanUrl = url.replace(/^\/+/, '');
        const target = `${base}/${cleanUrl}`;
        
        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                if (attempt > 0) {
                    const delay = 1000 * attempt;
                    console.log(`[API] Retrying request to ${target}. Attempt ${attempt} of ${retries} after ${delay}ms...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                }
                
                const res = await fetch(target, {
                    ...options,
                    // Use Next.js built-in caching for 5 minutes
                    next: { revalidate: 300 }
                });

                if (res.status === 429 || res.status >= 500) {
                    console.warn(`[API] ${res.status} Rate Limited/Error on ${target}.`);
                    if (attempt === retries) {
                        return { ok: false, json: async () => [] } as unknown as Response;
                    }
                    continue; // retry
                }

                return res;
            } catch (err: any) {
                console.error(`[API] Network error fetching ${target}:`, err?.message || err);
                if (attempt === retries) {
                    return { ok: false, json: async () => [] } as unknown as Response;
                }
            }
        }
        
        return { ok: false, json: async () => [] } as unknown as Response;
    };

    return {
        get: (url: string) => fetchWithRetry(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' }
        }),
        post: (url: string, body: unknown) => fetchWithRetry(url, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: { 'Content-Type': 'application/json' }
        })
    }
}