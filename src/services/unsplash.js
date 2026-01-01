const ACCESS_KEY = import.meta.env.VITE_UNSPLASH_ACCESS_KEY;
const APP_NAME = import.meta.env.VITE_UNSPLASH_APP_NAME || "MyApp";

if (!ACCESS_KEY) {
    throw new Error(
        "Missing VITE_UNSPLASH_ACCESS_KEY. Add it to .env.local and restart the dev server."
    );
}

function withUtm(url) {
    const u = new URL(url);
    u.searchParams.set("utm_source", APP_NAME);
    u.searchParams.set("utm_medium", "referral");
    return u.toString();
}

export async function searchUnsplashPhotos(query, { page = 1, perPage = 9, signal } = {}) {
    const url = new URL("https://api.unsplash.com/search/photos");
    url.searchParams.set("query", query);
    url.searchParams.set("page", String(page));
    url.searchParams.set("per_page", String(perPage));
    url.searchParams.set("orientation", "squarish");
    url.searchParams.set("content_filter", "high");

    const res = await fetch(url.toString(), {
        method: "GET",
        signal,
        headers: {
        Authorization: `Client-ID ${ACCESS_KEY}`,
        "Accept-Version": "v1",
        },
    });

    if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`Unsplash error ${res.status}: ${text || res.statusText}`);
    }

    const data = await res.json();

    return (data.results || []).map((p) => ({
        id: p.id,
        src: p.urls?.small,        
        srcFull: p.urls?.full,     
        alt: p.alt_description || "Прикраса",
        photographerName: p.user?.name || "Unknown",
        photographerUrl: p.user?.links?.html ? withUtm(p.user.links.html) : null,
        photoUrl: p.links?.html ? withUtm(p.links.html) : null,
    }));
}
