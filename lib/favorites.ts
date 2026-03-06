export const FAV_KEY = "tcg:favorites:v1";

export function loadFavorites(): Set<string> {
    try {
        const raw = localStorage.getItem(FAV_KEY);
        if (!raw) return new Set();
        const ids = JSON.parse(raw) as string[];
        return new Set(ids);
    } catch {
        return new Set();
    }
}

export function saveFavorites(favs: Set<string>) {
    try {
        localStorage.setItem(FAV_KEY, JSON.stringify(Array.from(favs)));
    } catch {
        // ignore
    }
}