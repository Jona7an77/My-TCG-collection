"use client";

import type { Card } from "@/lib/cards";
import TradingCard from "@/components/TradingCard";

export default function CollectionGrid({
    cards,
    favorites,
    onToggleFavorite,
    onTagClick,
}: {
    cards: Card[];
    favorites: Set<string>;
    onToggleFavorite: (id: string) => void;
    onTagClick?: (tag: string) => void;
}) {
    return (
        <section className="grid grid-cols-2 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((c) => {
                const isFav = favorites.has(c.id);

                return (
                    <div key={c.id} className="flex justify-center">
                        <div className="relative">
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    onToggleFavorite(c.id);
                                }}
                                className={`absolute right-3 top-3 z-50 rounded-full px-3 py-2 text-sm ring-1 transition ${isFav
                                    ? "bg-pink-500/25 text-pink-200 ring-pink-400/30"
                                    : "bg-black/35 text-white/80 ring-white/10 hover:bg-black/45"
                                    }`}
                                aria-label={isFav ? "Remove from favorites" : "Add to favorites"}
                                title={isFav ? "Unfavorite" : "Favorite"}
                            >
                                {isFav ? "♥" : "♡"}
                            </button>

                            <a
                                href={`/cards/${c.id}`}
                                className="block"
                                aria-label={`Open ${c.name}`}
                            >
                                <TradingCard card={c} />
                            </a>

                            {/* Tag chips below card */}
                            <div className="mt-3 flex flex-wrap justify-center gap-2">
                                {c.tags.map((tag) => (
                                    <button
                                        key={tag}
                                        type="button"
                                        onClick={() => onTagClick?.(tag)}
                                        className="rounded-full bg-white/5 px-2 py-1 text-[11px] text-zinc-200 ring-1 ring-white/10 hover:bg-white/10"
                                    >
                                        #{tag}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            })}
        </section>
    );
}