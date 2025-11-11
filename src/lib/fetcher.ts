export async function fetchWithCookie(url: string, options: RequestInit = {}) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}${url}`, {
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json',
            ...(options.headers || {}),
        },
        ...options,
    });

    const data = await res.json();
    return {
        ok: res.ok,
        data,
    };
}
