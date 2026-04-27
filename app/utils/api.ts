export default function api() {
    const apiUrl = process.env.NEXT_OPENF1_API_URL
    if (!apiUrl) {
        throw new Error('NEXT_OPENF1_API_URL is not defined')
    }
    return {
        get: (url: string) => fetch(`${apiUrl}${url}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        }),
        post: (url: string, body: unknown) => fetch(`${apiUrl}${url}`, {
            method: 'POST',
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json'
            }
        })
    }
}