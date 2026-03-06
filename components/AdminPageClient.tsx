"use client";

import { useState } from "react";
import type { Card } from "@/lib/cards";
import AdminCardForm from "@/components/AdminCardForm";
import AdminSavedCards from "@/components/AdminSavedCards";

export default function AdminPageClient({
    initialCards,
}: {
    initialCards: Card[];
}) {
    const [cards, setCards] = useState<Card[]>(initialCards);
    const [editingCard, setEditingCard] = useState<Card | null>(null);

    const refreshFromReload = () => {
        window.location.reload();
    };

    return (
        <>
            <AdminCardForm
                editingCard={editingCard}
                existingCards={cards}
                onSaved={refreshFromReload}
                onCancelEdit={() => setEditingCard(null)}
            />

            <AdminSavedCards
                initialCards={cards}
                onEditCard={(card) => setEditingCard(card)}
                onDeleted={refreshFromReload}
            />
        </>
    );
}