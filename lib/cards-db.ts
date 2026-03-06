import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/cards";
import { cards as localJsonCards } from "@/lib/cards";

type CardRow = {
    id: string;
    name: string;
    rarity: Card["rarity"];
    set_name: string;
    tags: string[];

    artist: string | null;
    release_date: string | null;
    lore: string | null;
    flavor_text: string | null;

    number: string | null;
    card_type: Card["cardType"] | null;

    stats: Card["stats"] | null;
    moves: Card["moves"] | null;

    bg_url: string;
    art_url: string;
    frame_url: string;
    foil_mask_url: string | null;
    flat_foil_mask_url: string | null;
    parallax: Card["layers"]["parallax"] | null;
};

function mapRowToCard(row: CardRow): Card {
    return {
        id: row.id,
        name: row.name,
        rarity: row.rarity,
        set: row.set_name,
        tags: row.tags ?? [],

        artist: row.artist ?? undefined,
        releaseDate: row.release_date ?? undefined,
        lore: row.lore ?? undefined,
        flavorText: row.flavor_text ?? undefined,

        number: row.number ?? undefined,
        cardType: row.card_type ?? undefined,

        stats: row.stats ?? undefined,
        moves: row.moves ?? undefined,

        layers: {
            bg: row.bg_url,
            art: row.art_url,
            frame: row.frame_url,
            foilMask: row.foil_mask_url ?? undefined,
            flatFoilMask: row.flat_foil_mask_url ?? undefined,
            parallax: row.parallax ?? undefined,
        },
    };
}

export async function getSupabaseCards() {
    const supabase = await createClient();

    const { data, error } = await supabase
        .from("cards")
        .select("*")
        .order("created_at", { ascending: true });

    if (error) {
        throw new Error(error.message);
    }

    return ((data ?? []) as CardRow[]).map(mapRowToCard);
}

export async function getAllCardsMerged() {
    const dbCards = await getSupabaseCards();

    // JSON cards first, then DB cards that don't duplicate existing IDs
    const existingIds = new Set(localJsonCards.map((c) => c.id));
    const uniqueDbCards = dbCards.filter((c) => !existingIds.has(c.id));

    return [...localJsonCards, ...uniqueDbCards];
}

export async function getMergedCardById(id: string) {
    const allCards = await getAllCardsMerged();
    return allCards.find((c) => c.id === id) ?? null;
}