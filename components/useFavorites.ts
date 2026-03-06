"use client";

import { useEffect, useState } from "react";
import { loadFavorites, saveFavorites } from "@/lib/favorites";

export function useFavorites() {
    const [favorites, setFavorites] = useState<Set<string>>(new Set());

    useEffect(() => {
        setFavorites(loadFavorites());
    }, []);

    const toggleFavorite = (id: string) => {
        setFavorites((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            saveFavorites(next);
            return next;
        });
    };

    return {
        favorites,
        toggleFavorite,
    };
}