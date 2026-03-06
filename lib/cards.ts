import rawCards from "@/data/cards.json";

export type Card = {
    id: string;
    name: string;
    rarity: "Common" | "Rare" | "Ultra Rare";
    set: string;
    tags: string[];

    artist?: string;
    releaseDate?: string;
    lore?: string;
    flavorText?: string;

    number?: string;
    cardType?:
    | "Creature"
    | "Dragon"
    | "Mage"
    | "Beast"
    | "Guardian"
    | "Spirit"
    | "Warrior"
    | "Human";

    stats?: {
        hp?: number;
        element?:
        | "Fire"
        | "Water"
        | "Ice"
        | "Electric"
        | "Cosmic"
        | "Earth"
        | "Wind"
        | "Dark"
        | "Light";
        attack?: number;
        defense?: number;
        speed?: number;
        weakness?: string;
        resistance?: string;
        retreatCost?: number;
    };

    moves?: Array<{
        name: string;
        cost?: number;
        damage?: number;
        text: string;
    }>;

    layers: {
        bg: string;
        art: string;
        frame: string;
        foilMask?: string;
        flatFoilMask?: string;
        parallax?: {
            bg?: number;
            art?: number;
            foil?: number;
            flatFoil?: number;
            frame?: number;
            text?: number;
            foilOpacity?: number;
            flatFoilOpacity?: number;
        };
    }
};

export const cards = rawCards as Card[];

export function getCard(id: string) {
    return cards.find((c) => c.id === id) ?? null;
}

export function getCardIndex(id: string) {
    return cards.findIndex((c) => c.id === id);
}

export function getPrevNext(id: string) {
    const i = getCardIndex(id);
    if (i === -1) return { prev: null as null | Card, next: null as null | Card };

    return {
        prev: i > 0 ? cards[i - 1] : null,
        next: i < cards.length - 1 ? cards[i + 1] : null,
    };
}

export function getRelated(cardId: string, max = 6) {
    const base = getCard(cardId);
    if (!base) return [];

    const scoreCard = (candidate: Card) => {
        let score = 0;

        if (candidate.set === base.set) score += 4;
        if (candidate.rarity === base.rarity) score += 1;

        const sharedTags = candidate.tags.filter((tag) => base.tags.includes(tag)).length;
        score += sharedTags * 2;

        return score;
    };

    return cards
        .filter((c) => c.id !== cardId)
        .map((c) => ({ card: c, score: scoreCard(c) }))
        .filter((x) => x.score > 0)
        .sort((a, b) => b.score - a.score)
        .slice(0, max)
        .map((x) => x.card);
}