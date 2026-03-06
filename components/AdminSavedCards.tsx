"use client";

import { useState } from "react";
import type { Card } from "@/lib/cards";
import { deleteCardRow } from "@/lib/cards-admin";

export default function AdminSavedCards({
    initialCards,
    onEditCard,
    onDeleted,
}: {
    initialCards: Card[];
    onEditCard: (card: Card) => void;
    onDeleted?: () => void;
}) {
    const [cards, setCards] = useState<Card[]>(initialCards);
    const [message, setMessage] = useState("");

    const remove = async (id: string) => {
        const ok = window.confirm(`Delete card "${id}"?`);
        if (!ok) return;

        setMessage("");

        try {
            await deleteCardRow(id);
            setCards((prev) => prev.filter((c) => c.id !== id));
            setMessage(`Card "${id}" deleted.`);
            onDeleted?.();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        }
    };

    return (
        <section className="mt-8 glass-panel rounded-3xl p-6">
            <div className="mb-4">
                <h2 className="text-xl font-semibold">Saved Supabase cards</h2>
                <p className="mt-2 text-sm text-zinc-300">
                    These are cards currently saved in your Supabase database.
                </p>
            </div>

            {message ? <p className="mb-4 text-sm text-zinc-300">{message}</p> : null}

            {cards.length === 0 ? (
                <div className="rounded-2xl bg-black/20 p-4 text-sm text-zinc-400 ring-1 ring-white/10">
                    No saved Supabase cards yet.
                </div>
            ) : (
                <div className="space-y-3">
                    {cards.map((card) => (
                        <div
                            key={card.id}
                            className="flex flex-col gap-3 rounded-2xl bg-black/20 p-4 ring-1 ring-white/10 sm:flex-row sm:items-center sm:justify-between"
                        >
                            <div>
                                <div className="font-medium text-white">
                                    {card.id} — {card.name}
                                </div>
                                <div className="mt-1 text-sm text-zinc-300">
                                    {card.rarity} • {card.set}
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                                <a
                                    href={`/cards/${card.id}`}
                                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                                >
                                    View
                                </a>

                                <button
                                    type="button"
                                    onClick={() => onEditCard(card)}
                                    className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                                >
                                    Edit
                                </button>

                                <button
                                    type="button"
                                    onClick={() => remove(card.id)}
                                    className="rounded-full bg-red-500/15 px-3 py-1.5 text-xs text-red-200 hover:bg-red-500/25"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </section>
    );
}