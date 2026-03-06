"use client";

import type { Card } from "@/lib/cards";
import TradingCard from "@/components/TradingCard";
import FavoriteToggle from "@/components/FavoriteToggle";

function Stat({
    label,
    value,
}: {
    label: string;
    value: string | number | undefined;
}) {
    return (
        <div className="glass-panel rounded-2xl p-3">
            <div className="text-[11px] uppercase tracking-wide text-zinc-400">{label}</div>
            <div className="mt-1 text-sm font-semibold text-white">{value ?? "—"}</div>
        </div>
    );
}

function rarityClass(rarity: Card["rarity"]) {
    switch (rarity) {
        case "Ultra Rare":
            return "rarity-ultra";
        case "Rare":
            return "rarity-rare";
        default:
            return "rarity-common";
    }
}

export default function CardDetailClient({
    card,
    related,
}: {
    card: Card;
    related?: Card[];
}) {
    return (
        <div className="space-y-10 detail-entrance">
            <div className="grid gap-10 lg:grid-cols-[380px_1fr] items-start">
                {/* Featured card */}
                <div className="relative flex justify-center lg:justify-start">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            {/* Inner core – hot fuchsia burst, fast */}
                            <div
                                className="card-ambient-glow absolute h-[280px] w-[280px] rounded-full bg-fuchsia-500/40"
                                style={{ animation: "flare-a 2.8s ease-in-out infinite alternate" }}
                            />
                            {/* Mid ring – cyan breath, offset phase */}
                            <div
                                className="card-ambient-glow absolute h-[490px] w-[490px] rounded-full bg-cyan-400/25"
                                style={{ animation: "flare-b 4.9s ease-in-out infinite alternate", animationDelay: "-2.4s" }}
                            />
                            {/* Outer haze – violet aurora, very slow */}
                            <div
                                className="card-ambient-glow absolute h-[630px] w-[630px] rounded-full bg-violet-500/35"
                                style={{ animation: "flare-c 6.3s ease-in-out infinite alternate", animationDelay: "-3.15s" }}
                            />
                        </div>
                    </div>

                    <div className="relative detail-float">
                        <TradingCard card={card} large />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    <div className="glass-panel rounded-3xl p-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <div className="text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                                    {card.cardType ?? "Card"} • {card.number ?? "—"}
                                </div>

                                <h1 className="mt-2 text-4xl font-semibold tracking-tight">
                                    {card.name}
                                </h1>

                                <div className="mt-3 flex flex-wrap items-center gap-2">
                                    <span
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${rarityClass(card.rarity)}`}
                                    >
                                        {card.rarity}
                                    </span>

                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
                                        {card.set}
                                    </span>

                                    <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-300 ring-1 ring-white/10">
                                        Element: {card.stats?.element ?? "—"}
                                    </span>
                                </div>
                            </div>

                            <FavoriteToggle cardId={card.id} />
                        </div>

                        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
                            <Stat label="Artist" value={card.artist} />
                            <Stat label="Release" value={card.releaseDate} />
                            <Stat label="Card No." value={card.number} />
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6">
                        <h2 className="text-lg font-semibold">Lore</h2>
                        <p className="mt-3 text-zinc-300 leading-relaxed">
                            {card.lore ?? "No lore yet."}
                        </p>

                        <div className="glass-panel mt-5 rounded-2xl px-4 py-4">
                            <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                                Flavor text
                            </div>
                            <p className="mt-2 italic text-zinc-200">
                                “{card.flavorText ?? "No flavor text yet."}”
                            </p>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6">
                        <h2 className="text-lg font-semibold">Battle profile</h2>
                        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Stat label="HP" value={card.stats?.hp} />
                            <Stat label="Attack" value={card.stats?.attack} />
                            <Stat label="Defense" value={card.stats?.defense} />
                            <Stat label="Speed" value={card.stats?.speed} />
                            <Stat label="Weakness" value={card.stats?.weakness} />
                            <Stat label="Resistance" value={card.stats?.resistance} />
                            <Stat label="Retreat Cost" value={card.stats?.retreatCost} />
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl p-6">
                        <h2 className="text-lg font-semibold">Moves</h2>

                        {card.moves?.length ? (
                            <div className="mt-4 space-y-3">
                                {card.moves.map((m, idx) => (
                                    <div
                                        key={idx}
                                        className="glass-panel rounded-2xl p-4"
                                    >
                                        <div className="flex flex-wrap items-center justify-between gap-2">
                                            <div className="text-base font-semibold">{m.name}</div>
                                            <div className="text-xs text-zinc-300">
                                                {m.cost != null ? `Cost: ${m.cost}` : ""}
                                                {m.cost != null && m.damage != null ? " • " : ""}
                                                {m.damage != null ? `Damage: ${m.damage}` : ""}
                                            </div>
                                        </div>
                                        <div className="mt-2 text-sm text-zinc-300 leading-relaxed">
                                            {m.text}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="mt-3 text-zinc-300">No moves yet.</p>
                        )}
                    </div>

                    <div className="glass-panel rounded-3xl p-6">
                        <h2 className="text-lg font-semibold">Tags</h2>
                        <div className="mt-3 flex flex-wrap gap-2">
                            {card.tags.map((t) => (
                                <span
                                    key={t}
                                    className="rounded-full bg-white/5 px-3 py-1 text-xs text-zinc-200 ring-1 ring-white/10"
                                >
                                    #{t}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Related cards */}
            {related && (
                <section className="detail-entrance">
                    <h2 className="text-lg font-semibold">Related cards</h2>

                    {related.length === 0 ? (
                        <p className="mt-2 text-sm text-zinc-400">No related cards yet.</p>
                    ) : (
                        <div className="mt-4 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 overflow-hidden">
                            {related.map((c) => (
                                <a
                                    key={c.id}
                                    href={`/cards/${c.id}`}
                                    className="flex justify-center"
                                    aria-label={`Open ${c.name}`}
                                >
                                    <TradingCard card={c} small />
                                </a>
                            ))}
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}