"use client";

import { useEffect, useMemo, useState } from "react";
import { loadFavorites, saveFavorites } from "@/lib/favorites";

export default function FavoriteToggle({
    cardId,
    className,
}: {
    cardId: string;
    className?: string;
}) {
    const [favs, setFavs] = useState<Set<string>>(() => new Set());
    const isFav = useMemo(() => favs.has(cardId), [favs, cardId]);

    useEffect(() => {
        setFavs(loadFavorites());
    }, []);

    const toggle = () => {
        setFavs((prev) => {
            const next = new Set(prev);
            if (next.has(cardId)) next.delete(cardId);
            else next.add(cardId);
            saveFavorites(next);
            return next;
        });
    };

    return (
        <button
            type="button"
            onClick={toggle}
            className={
                className ??
                `rounded-full px-3 py-2 text-sm ring-1 transition ${isFav
                    ? "bg-pink-500/25 text-pink-200 ring-pink-400/30"
                    : "bg-white/10 text-white ring-white/10 hover:bg-white/20"
                }`
            }
            aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
            title={isFav ? "Unfavorite" : "Favorite"}
        >
            {isFav ? "♥ Favorited" : "♡ Favorite"}
        </button>
    );
}