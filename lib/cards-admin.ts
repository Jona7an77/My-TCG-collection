"use client";

import { createClient } from "@/lib/supabase/client";
import type { Card } from "@/lib/cards";

type UploadInputs = {
    cardId: string;
    bgFile?: File | null;
    artFile?: File | null;
    frameFile?: File | null;
    foilMaskFile?: File | null;
    flatFoilMaskFile?: File | null;
};

type SaveCardInputs = {
    card: Card;
    bgUrl: string;
    artUrl: string;
    frameUrl: string;
    foilMaskUrl?: string;
    flatFoilMaskUrl?: string;
};

function cleanFileName(name: string) {
    return name.replace(/\s+/g, "-").toLowerCase();
}

async function uploadToBucket(file: File, path: string) {
    const supabase = createClient();

    const { error } = await supabase.storage.from("card-assets").upload(path, file, {
        upsert: true,
        contentType: file.type || undefined,
    });

    if (error) throw new Error(error.message);

    const { data } = supabase.storage.from("card-assets").getPublicUrl(path);
    return data.publicUrl;
}

export async function uploadCardAssets({
    cardId,
    bgFile,
    artFile,
    frameFile,
    foilMaskFile,
    flatFoilMaskFile,
}: UploadInputs) {
    const safeId = cardId.trim();

    let bgUrl: string | undefined;
    let artUrl: string | undefined;
    let frameUrl: string | undefined;
    let foilMaskUrl: string | undefined;
    let flatFoilMaskUrl: string | undefined;

    if (flatFoilMaskFile) {
        const flatPath = `cards/${safeId}/flat-foil-mask-${cleanFileName(
            flatFoilMaskFile.name
        )}`;
        flatFoilMaskUrl = await uploadToBucket(flatFoilMaskFile, flatPath);
    }

    if (bgFile) {
        const bgPath = `cards/${safeId}/bg-${cleanFileName(bgFile.name)}`;
        bgUrl = await uploadToBucket(bgFile, bgPath);
    }

    if (artFile) {
        const artPath = `cards/${safeId}/art-${cleanFileName(artFile.name)}`;
        artUrl = await uploadToBucket(artFile, artPath);
    }

    if (frameFile) {
        const framePath = `cards/${safeId}/frame-${cleanFileName(frameFile.name)}`;
        frameUrl = await uploadToBucket(frameFile, framePath);
    }

    if (foilMaskFile) {
        const foilPath = `cards/${safeId}/foil-mask-${cleanFileName(foilMaskFile.name)}`;
        foilMaskUrl = await uploadToBucket(foilMaskFile, foilPath);
    }

    return {
        bgUrl,
        artUrl,
        frameUrl,
        foilMaskUrl,
        flatFoilMaskUrl,
    };
}

export async function insertCardRow({
    card,
    bgUrl,
    artUrl,
    frameUrl,
    foilMaskUrl,
    flatFoilMaskUrl,
}: SaveCardInputs) {
    const supabase = createClient();

    const payload = {
        id: card.id,
        name: card.name,
        rarity: card.rarity,
        set_name: card.set,
        tags: card.tags,

        artist: card.artist ?? null,
        release_date: card.releaseDate ?? null,
        lore: card.lore ?? null,
        flavor_text: card.flavorText ?? null,

        number: card.number ?? null,
        card_type: card.cardType ?? null,

        stats: card.stats ?? null,
        moves: card.moves ?? null,

        bg_url: bgUrl,
        art_url: artUrl,
        frame_url: frameUrl,
        foil_mask_url: foilMaskUrl ?? null,
        flat_foil_mask_url: flatFoilMaskUrl ?? null,
        parallax: card.layers.parallax ?? null,
    };

    const { error } = await supabase.from("cards").insert(payload);
    if (error) throw new Error(error.message);
}

export async function updateCardRow(card: Card) {
    const supabase = createClient();

    const payload = {
        name: card.name,
        rarity: card.rarity,
        set_name: card.set,
        tags: card.tags,

        artist: card.artist ?? null,
        release_date: card.releaseDate ?? null,
        lore: card.lore ?? null,
        flavor_text: card.flavorText ?? null,

        number: card.number ?? null,
        card_type: card.cardType ?? null,

        stats: card.stats ?? null,
        moves: card.moves ?? null,

        bg_url: card.layers.bg,
        art_url: card.layers.art,
        frame_url: card.layers.frame,
        foil_mask_url: card.layers.foilMask ?? null,
        flat_foil_mask_url: card.layers.flatFoilMask ?? null,
        parallax: card.layers.parallax ?? null,
    };

    const { error } = await supabase.from("cards").update(payload).eq("id", card.id);
    if (error) throw new Error(error.message);
}

export async function deleteCardRow(cardId: string) {
    const supabase = createClient();

    const { error } = await supabase.from("cards").delete().eq("id", cardId);
    if (error) throw new Error(error.message);
}

/* -------------------------------------------------------------------------- */
/*                     Delete from Storage + clear DB URL                      */
/* -------------------------------------------------------------------------- */

type CardAssetKey = "bg" | "art" | "frame" | "foilMask" | "flatFoilMask";

const assetKeyToDbColumn: Record<CardAssetKey, string> = {
    bg: "bg_url",
    art: "art_url",
    frame: "frame_url",
    foilMask: "foil_mask_url",
    flatFoilMask: "flat_foil_mask_url",
};

export function storagePathFromPublicUrl(bucket: string, publicUrl: string) {
    // Handles:
    // https://<project>.supabase.co/storage/v1/object/public/<bucket>/<path>
    const clean = publicUrl.split("?")[0];
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = clean.indexOf(marker);
    if (idx === -1) return null;
    return clean.slice(idx + marker.length);
}

export async function deleteStorageObjectByPublicUrl(bucket: string, publicUrl: string) {
    const supabase = createClient();
    const path = storagePathFromPublicUrl(bucket, publicUrl);
    if (!path) throw new Error("Could not parse storage path from URL.");

    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) throw new Error(error.message);
}

export async function deleteAssetAndClearDb(cardId: string, key: CardAssetKey, publicUrl: string) {
    // 1) delete file from Storage
    await deleteStorageObjectByPublicUrl("card-assets", publicUrl);

    // 2) clear the URL column in DB
    const supabase = createClient();
    const col = assetKeyToDbColumn[key];

    const { error } = await supabase.from("cards").update({ [col]: null }).eq("id", cardId);
    if (error) throw new Error(error.message);
}