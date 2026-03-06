"use client";

import { useMemo, useState } from "react";
import clsx from "clsx";
import type { Card } from "@/lib/cards";
import CollectionGrid from "@/components/CollectionGrid";
import { useFavorites } from "@/components/useFavorites";

type SortKey =
    | "id-asc"
    | "id-desc"
    | "name-asc"
    | "name-desc"
    | "rarity-asc"
    | "rarity-desc"
    | "set-asc"
    | "set-desc";

const rarityOrder: Record<string, number> = {
    Common: 1,
    Rare: 2,
    "Ultra Rare": 3,
};

export default function HomePageClient({
    initialCards,
}: {
    initialCards: Card[];
}) {
    const { favorites, toggleFavorite } = useFavorites();

    const [query, setQuery] = useState("");
    const [rarity, setRarity] = useState<"All" | Card["rarity"]>("All");
    const [setName, setSetName] = useState<"All" | string>("All");
    const [selectedTag, setSelectedTag] = useState<string | "All">("All");
    const [sort, setSort] = useState<SortKey>("id-asc");
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    const sets = useMemo(() => {
        const s = Array.from(new Set(initialCards.map((c) => c.set)));
        s.sort((a, b) => a.localeCompare(b));
        return s;
    }, [initialCards]);

    const allTags = useMemo(() => {
        const t = Array.from(new Set(initialCards.flatMap((c) => c.tags)));
        t.sort((a, b) => a.localeCompare(b));
        return t;
    }, [initialCards]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();

        const list = initialCards.filter((c) => {
            const matchesQuery =
                q.length === 0 ||
                c.name.toLowerCase().includes(q) ||
                c.set.toLowerCase().includes(q) ||
                c.tags.some((t) => t.toLowerCase().includes(q));

            const matchesRarity = rarity === "All" ? true : c.rarity === rarity;
            const matchesSet = setName === "All" ? true : c.set === setName;
            const matchesTag =
                selectedTag === "All" ? true : c.tags.includes(selectedTag);

            return matchesQuery && matchesRarity && matchesSet && matchesTag;
        });

        list.sort((a, b) => {
            switch (sort) {
                case "id-asc":
                    return a.id.localeCompare(b.id);
                case "id-desc":
                    return b.id.localeCompare(a.id);
                case "name-asc":
                    return a.name.localeCompare(b.name);
                case "name-desc":
                    return b.name.localeCompare(a.name);
                case "rarity-asc":
                    return (rarityOrder[a.rarity] ?? 0) - (rarityOrder[b.rarity] ?? 0);
                case "rarity-desc":
                    return (rarityOrder[b.rarity] ?? 0) - (rarityOrder[a.rarity] ?? 0);
                case "set-asc":
                    return a.set.localeCompare(b.set);
                case "set-desc":
                    return b.set.localeCompare(a.set);
                default:
                    return 0;
            }
        });

        return list;
    }, [initialCards, query, rarity, setName, selectedTag, sort]);

    const clear = () => {
        setQuery("");
        setRarity("All");
        setSetName("All");
        setSelectedTag("All");
        setSort("id-asc");
    };

    return (
        <main className="mx-auto max-w-6xl px-5 py-10">
            <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <a
                    href="/admin"
                    className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 mt-5"
                >
                    Admin
                </a>

                <div>
                    <h1 className="text-5xl font-semibold text-cyan-500">
                        My Trading Card Collection
                    </h1>
                </div>

                <a
                    href="/favorites"
                    className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 mt-5"
                >
                    View favorites
                </a>
            </header>

            <section className="mb-6 rounded-2xl bg-white/5 ring-1 ring-white/10 p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1 block text-xs text-zinc-300">Search</label>
                        <input
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Search name, set, tags..."
                            className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-500 outline-none ring-1 ring-white/10 focus:ring-white/20"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={() => setShowMobileFilters((v) => !v)}
                        className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20 sm:hidden"
                    >
                        {showMobileFilters ? "Hide filters" : "Show filters"}
                    </button>
                </div>

                <div
                    className={clsx(
                        "mt-4 space-y-4",
                        showMobileFilters ? "block" : "hidden sm:block"
                    )}
                >
                    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                        <div>
                            <label className="mb-1 block text-xs text-zinc-300">Rarity</label>
                            <select
                                value={rarity}
                                onChange={(e) => setRarity(e.target.value as any)}
                                className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-white/20"
                            >
                                <option value="All">All</option>
                                <option value="Common">Common</option>
                                <option value="Rare">Rare</option>
                                <option value="Ultra Rare">Ultra Rare</option>
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-zinc-300">Set</label>
                            <select
                                value={setName}
                                onChange={(e) => setSetName(e.target.value)}
                                className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-white/20"
                            >
                                <option value="All">All</option>
                                {sets.map((s) => (
                                    <option key={s} value={s}>
                                        {s}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-zinc-300">Tag</label>
                            <select
                                value={selectedTag}
                                onChange={(e) => setSelectedTag(e.target.value)}
                                className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-white/20"
                            >
                                <option value="All">All</option>
                                {allTags.map((t) => (
                                    <option key={t} value={t}>
                                        {t}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs text-zinc-300">Sort</label>
                            <select
                                value={sort}
                                onChange={(e) => setSort(e.target.value as SortKey)}
                                className="w-full rounded-xl bg-black/30 px-3 py-2 text-sm text-zinc-100 outline-none ring-1 ring-white/10 focus:ring-white/20"
                            >
                                <option value="id-asc">ID ↑</option>
                                <option value="id-desc">ID ↓</option>
                                <option value="name-asc">Name A → Z</option>
                                <option value="name-desc">Name Z → A</option>
                                <option value="rarity-asc">Rarity low → high</option>
                                <option value="rarity-desc">Rarity high → low</option>
                                <option value="set-asc">Set A → Z</option>
                                <option value="set-desc">Set Z → A</option>
                            </select>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="text-sm text-zinc-300">
                            Showing <span className="text-white">{filtered.length}</span> of{" "}
                            <span className="text-white">{initialCards.length}</span> cards •
                            Favorites <span className="text-white">{favorites.size}</span>
                        </div>

                        <button
                            onClick={clear}
                            className="rounded-xl bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                        >
                            Clear filters
                        </button>
                    </div>
                </div>
            </section>

            <CollectionGrid
                cards={filtered}
                favorites={favorites}
                onToggleFavorite={toggleFavorite}
                onTagClick={(tag) => {
                    setSelectedTag(tag);
                    setShowMobileFilters(false);
                }}
            />
        </main>
    );
}