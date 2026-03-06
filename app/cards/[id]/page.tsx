import { notFound } from "next/navigation";
import CardDetailClient from "@/components/CardDetailClient";
import { getAllCardsMerged, getMergedCardById } from "@/lib/cards-db";

export default async function CardDetailPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    const card = await getMergedCardById(id);

    if (!card) {
        return notFound();
    }

    const allCards = await getAllCardsMerged();
    const index = allCards.findIndex((c) => c.id === card.id);

    const prev = index > 0 ? allCards[index - 1] : null;
    const next = index < allCards.length - 1 ? allCards[index + 1] : null;

    const related = allCards
        .filter((c) => c.id !== card.id)
        .map((c) => {
            let score = 0;
            if (c.set === card.set) score += 4;
            if (c.rarity === card.rarity) score += 1;
            const sharedTags = c.tags.filter((tag) => card.tags.includes(tag)).length;
            score += sharedTags * 2;
            return { card: c, score };
        })
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, 6)
        .map((x) => x.card);

    return (
        <main className="mx-auto max-w-6xl px-5 py-10">
            <nav className="mb-6 text-sm text-zinc-400">
                <a href="/" className="hover:text-white">
                    Collection
                </a>
                <span className="mx-2">/</span>
                <span className="text-zinc-200">{card.name}</span>
            </nav>

            <div className="mb-8 flex items-center justify-between gap-3">
                <div>
                    {prev ? (
                        <a
                            href={`/cards/${prev.id}`}
                            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                        >
                            ← {prev.name}
                        </a>
                    ) : (
                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/40">
                            ← Start
                        </span>
                    )}
                </div>

                <a href="/" className="text-sm text-zinc-300 hover:text-white">
                    Back to collection
                </a>

                <div>
                    {next ? (
                        <a
                            href={`/cards/${next.id}`}
                            className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white hover:bg-white/20"
                        >
                            {next.name} →
                        </a>
                    ) : (
                        <span className="rounded-full bg-white/5 px-3 py-1.5 text-xs text-white/40">
                            End →
                        </span>
                    )}
                </div>
            </div>

            <CardDetailClient card={card} related={related} />
        </main>
    );
}