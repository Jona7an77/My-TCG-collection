"use client";

function rarityToIntensity(rarity: string, flat: boolean) {
    if (flat) {
        switch (rarity) {
            case "Ultra Rare":
                return 0.32;
            case "Rare":
                return 0.22;
            default:
                return 0.12;
        }
    }

    switch (rarity) {
        case "Ultra Rare":
            return 0.95;
        case "Rare":
            return 0.75;
        default:
            return 0.38;
    }
}

function rarityToMaskUrl(rarity: string) {
    switch (rarity) {
        case "Ultra Rare":
            return "/masks/mask-ultra.png";
        case "Rare":
            return "/masks/mask-rare.png";
        default:
            return "/masks/mask-common.png";
    }
}

type HoloFoilProps = {
    rarity: "Common" | "Rare" | "Ultra Rare";
    mask?: string;
    flat?: boolean;
    opacity?: number;
};

export default function HoloFoil({
    rarity,
    mask,
    flat = false,
    opacity,
}: HoloFoilProps) {
    const resolvedMask = mask || rarityToMaskUrl(rarity);
    const intensity = opacity ?? rarityToIntensity(rarity, flat);

    return (
        <div
            className={flat ? "holo-flat absolute inset-0" : "holo-layer absolute inset-0"}
            style={{
                opacity: intensity,
                WebkitMaskImage: `url(${resolvedMask})`,
                maskImage: `url(${resolvedMask})`,
                WebkitMaskRepeat: "no-repeat",
                maskRepeat: "no-repeat",
                WebkitMaskSize: "100% 100%",
                maskSize: "100% 100%",
                WebkitMaskPosition: "center",
                maskPosition: "center",
            }}
        >
            <div className={flat ? "holo-shine-flat absolute inset-0" : "holo-shine absolute inset-0"} />
        </div>
    );
}