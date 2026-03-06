"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import type { Card } from "@/lib/cards";
import TradingCard from "@/components/TradingCard";

export default function CardModal({
    card,
    onClose,
}: {
    card: Card;
    onClose: () => void;
}) {
    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") onClose();
        };
        document.addEventListener("keydown", onKeyDown);
        document.body.style.overflow = "hidden";
        return () => {
            document.removeEventListener("keydown", onKeyDown);
            document.body.style.overflow = "";
        };
    }, [onClose]);

    if (typeof window === "undefined") return null;

    return createPortal(
        <div
            className="fixed inset-0 z-[999] flex items-center justify-center p-6"
            aria-modal="true"
            role="dialog"
        >
            {/* Backdrop */}
            <button
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
                aria-label="Close"
            />

            {/* Card */}
            <div className="relative z-10">
                <TradingCard card={card} large />
            </div>

            {/* Close button */}
            <button
                onClick={onClose}
                className="absolute top-5 right-5 z-10 rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
            >
                Close (Esc)
            </button>
        </div>,
        document.body
    );
}