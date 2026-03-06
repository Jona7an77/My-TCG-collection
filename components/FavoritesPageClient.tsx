"use client";

import { useMemo } from "react";
import type { Card } from "@/lib/cards";
import CollectionGrid from "@/components/CollectionGrid";
import { useFavorites } from "@/components/useFavorites";

export default function FavoritesPageClient({
    initialCards,
}: {
    initialCards: Card[];
}) {
    const { favorites, toggleFavorite } = useFavorites();

    const favoriteCards = useMemo(() => {
        return initialCards.filter((c) => favorites.has(c.id));
    }, [initialCards, favorites]);

    return (
        <main className="mx-auto max-w-6xl px-5 py-10">
            <div className="mb-6 flex items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold">Favorites</h1>
                    <p className="mt-2 text-zinc-300">Your saved favorite cards.</p>
                </div>

                <a
                    href="/"
                    className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                >
                    Back to collection
                </a>
            </div>

            {favoriteCards.length === 0 ? (
                <div className="glass-panel rounded-2xl p-6 text-zinc-300">
                    You haven’t favorited any cards yet.
                </div>
            ) : (
                <CollectionGrid
                    cards={favoriteCards}
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                />
            )}
        </main>
    );
}