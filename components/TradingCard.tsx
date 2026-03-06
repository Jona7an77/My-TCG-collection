"use client";

import Atropos from "atropos/react";
import "atropos/css";
import Link from "next/link";
import { useCallback, useRef } from "react";
import clsx from "clsx";
import HoloFoil from "./HoloFoil";
import type { Card } from "@/lib/cards";

function rarityBadge(rarity: Card["rarity"]) {
    switch (rarity) {
        case "Ultra Rare":
            return "bg-fuchsia-500/45 text-fuchsia-100 ring-fuchsia-400/55";
        case "Rare":
            return "bg-cyan-500/45 text-cyan-100 ring-cyan-400/55";
        default:
            return "bg-zinc-200/30 text-zinc-100 ring-zinc-200/45";
    }
}

function rarityRing(rarity: Card["rarity"]) {
    switch (rarity) {
        case "Ultra Rare":
            return "ring-1 ring-fuchsia-300/20";
        case "Rare":
            return "ring-1 ring-cyan-300/20";
        default:
            return "ring-1 ring-white/10";
    }
}

function rarityGlow(rarity: Card["rarity"]) {
    switch (rarity) {
        case "Ultra Rare":
            return "shadow-[0_0_12px_rgba(236,72,153,0.10),0_0_24px_rgba(168,85,247,0.08)] group-hover:shadow-[0_0_34px_rgba(236,72,153,0.20),0_0_60px_rgba(168,85,247,0.16)]";
        case "Rare":
            return "shadow-[0_0_10px_rgba(34,211,238,0.08),0_0_20px_rgba(59,130,246,0.07)] group-hover:shadow-[0_0_28px_rgba(34,211,238,0.18),0_0_48px_rgba(59,130,246,0.14)]";
        default:
            return "shadow-[0_0_8px_rgba(255,255,255,0.04)] group-hover:shadow-[0_0_20px_rgba(255,255,255,0.08)]";
    }
}

export default function TradingCard({
    card,
    href,
    large = false,
    small = false,
}: {
    card: Card;
    href?: string;
    large?: boolean;
    small?: boolean;
}) {
    const rootRef = useRef<HTMLDivElement | null>(null);

    const onMove = useCallback((e: React.PointerEvent) => {
        const el = rootRef.current;
        if (!el) return;

        const r = el.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;

        el.style.setProperty("--mx", `${x}`);
        el.style.setProperty("--my", `${y}`);
        const dx = x - 0.5;
        const dy = y - 0.5;
        const tilt = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 2); // 0 center → 1 edges
        el.style.setProperty("--tilt", `${tilt}`);
    }, []);

    const onLeave = useCallback(() => {
        const el = rootRef.current;
        if (!el) return;
        el.style.setProperty("--mx", `0.5`);
        el.style.setProperty("--my", `0.5`);
        el.style.setProperty("--tilt", `0`);
    }, []);

    const Wrapper = href ? Link : ("div" as any);

    return (
        <Wrapper
            href={href as any}
            className={clsx("group block", href && "cursor-pointer")}
            aria-label={href ? `Open ${card.name}` : undefined}
        >
            <div
                ref={rootRef}
                onPointerMove={onMove}
                onPointerLeave={onLeave}
                className={clsx(
                    "card-root relative",
                    large
                        ? "w-[320px] h-[460px]"
                        : small
                            ? "w-[130px] h-[190px] sm:w-[160px] sm:h-[235px]"
                            : "w-[170px] h-[250px] sm:w-[260px] sm:h-[380px]"
                )}
                style={
                    {
                        ["--mx" as any]: 0.5,
                        ["--my" as any]: 0.5,
                    } as React.CSSProperties
                }
            >
                <Atropos
                    className="w-full h-full"
                    activeOffset={40}
                    rotateXMax={12}
                    rotateYMax={12}
                    highlight={false}
                >
                    <div
                        className={clsx(
                            "relative w-full h-full rounded-[22px] overflow-hidden bg-zinc-900 transition-all duration-300",
                            rarityRing(card.rarity),
                            rarityGlow(card.rarity)
                        )}
                    >
                        {card.layers.bg ? (
                            <img
                                src={card.layers.bg}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover z-0"
                                data-atropos-offset={card.layers.parallax?.bg ?? -4}
                                draggable={false}
                            />
                        ) : (
                            <div
                                className="absolute inset-0 z-0 bg-zinc-900"
                                data-atropos-offset={card.layers.parallax?.bg ?? -4}
                            />
                        )}

                        {card.layers.art ? (
                            <img
                                src={card.layers.art}
                                alt={card.name}
                                className="absolute inset-0 w-full h-full object-cover z-10"
                                data-atropos-offset={card.layers.parallax?.art ?? 6}
                                draggable={false}
                            />
                        ) : (
                            <div
                                className="absolute inset-0 z-10 flex items-center justify-center text-xs text-zinc-400"
                                data-atropos-offset={card.layers.parallax?.art ?? 6}
                            >
                                No art
                            </div>
                        )}

                        {/* Flat foil: surface-printed effect, no extra parallax depth */}
                        {card.layers.flatFoilMask && (
                            <div className="absolute inset-0 z-[15] pointer-events-none">
                                <HoloFoil
                                    rarity={card.rarity}
                                    mask={card.layers.flatFoilMask}
                                    flat
                                    opacity={card.layers.parallax?.flatFoilOpacity}
                                />
                            </div>
                        )}

                        {/* 3D foil: parallax-sensitive */}
                        <div data-atropos-offset={card.layers.parallax?.foil ?? 8} className="absolute inset-0 z-20">
                            <HoloFoil rarity={card.rarity} mask={card.layers.foilMask} opacity={card.layers.parallax?.foilOpacity} />
                        </div>

                        {card.layers.frame ? (
                            <img
                                src={card.layers.frame}
                                alt=""
                                className="absolute inset-0 w-full h-full object-cover pointer-events-none z-30"
                                data-atropos-offset={card.layers.parallax?.frame ?? 12}
                                draggable={false}
                            />
                        ) : null}

                        <div
                            data-atropos-offset={card.layers.parallax?.text ?? 14}
                            className={clsx(
                                "absolute z-40",
                                small ? "left-2 right-2 bottom-2" : "left-4 right-4 bottom-4"
                            )}
                        >
                            <div className="flex items-end justify-between gap-3">
                                <div>
                                    <div className={clsx(
                                        "font-semibold leading-tight drop-shadow",
                                        small ? "text-[10px]" : "text-lg"
                                    )}>
                                        {card.name}
                                    </div>
                                    <div className={clsx(
                                        "text-white/80 drop-shadow",
                                        small ? "text-[8px]" : "text-xs"
                                    )}>
                                        {card.set}
                                    </div>
                                </div>
                                <span
                                    className={clsx(
                                        "rounded-full ring-1 whitespace-nowrap",
                                        small ? "text-[8px] px-1 py-0.5" : "text-[11px] px-2 py-1",
                                        rarityBadge(card.rarity)
                                    )}
                                >
                                    {card.rarity}
                                </span>
                            </div>
                        </div>

                        <div className="pointer-events-none absolute inset-0 z-45 shadow-[inset_0_0_40px_rgba(0,0,0,0.25)]" />
                    </div>
                </Atropos>
            </div>
        </Wrapper>
    );
}