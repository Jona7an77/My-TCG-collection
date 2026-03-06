"use client";

import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/cards";
import {
    insertCardRow,
    updateCardRow,
    uploadCardAssets,
    deleteAssetAndClearDb,
} from "@/lib/cards-admin";

const blankMove = { name: "", cost: 0, damage: 0, text: "" };

type FormErrors = {
    id?: string;
    name?: string;
    set?: string;
    bgFile?: string;
    artFile?: string;
    frameFile?: string;
};

function createEmptyCard(): Card {
    return {
        id: "",
        name: "",
        rarity: "Common",
        set: "",
        tags: [],
        artist: "",
        releaseDate: "",
        lore: "",
        flavorText: "",
        number: "",
        cardType: "Creature",
        stats: {
            hp: 0,
            element: "Fire",
            attack: 0,
            defense: 0,
            speed: 0,
            weakness: "",
            resistance: "",
            retreatCost: 0,
        },
        moves: [{ ...blankMove }],
        layers: {
            bg: "",
            art: "",
            frame: "",
            foilMask: "",
            flatFoilMask: "",
            parallax: { bg: -4, art: 6, foil: 8, flatFoil: 0, frame: 12, text: 14, foilOpacity: 0.75, flatFoilOpacity: 0.22 },
        },
    };
}

function filePreviewUrl(file: File | null) {
    return file ? URL.createObjectURL(file) : "";
}

export default function AdminCardForm({
    editingCard,
    existingCards,
    onSaved,
    onCancelEdit,
}: {
    editingCard?: Card | null;
    existingCards: Card[];
    onSaved?: () => void;
    onCancelEdit?: () => void;
}) {
    const isEditMode = !!editingCard;

    const initialCard = useMemo(() => {
        return editingCard ? editingCard : createEmptyCard();
    }, [editingCard]);

    const [message, setMessage] = useState("");
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<FormErrors>({});

    const [bgFile, setBgFile] = useState<File | null>(null);
    const [artFile, setArtFile] = useState<File | null>(null);
    const [frameFile, setFrameFile] = useState<File | null>(null);
    const [foilMaskFile, setFoilMaskFile] = useState<File | null>(null);
    const [flatFoilMaskFile, setFlatFoilMaskFile] = useState<File | null>(null);
    const [flatFoilPreview, setFlatFoilPreview] = useState("");

    const [bgPreview, setBgPreview] = useState("");
    const [artPreview, setArtPreview] = useState("");
    const [framePreview, setFramePreview] = useState("");
    const [foilPreview, setFoilPreview] = useState("");

    const [form, setForm] = useState<Card>(initialCard);
    const [tagsInput, setTagsInput] = useState((initialCard.tags ?? []).join(", "));
    const [assetBusy, setAssetBusy] = useState<
        "" | "bg" | "art" | "frame" | "foilMask" | "flatFoilMask"
    >("");

    const deleteAsset = async (
        key: "bg" | "art" | "frame" | "foilMask" | "flatFoilMask"
    ) => {
        if (!isEditMode) return;

        const url = (form.layers as any)[key] as string | undefined;
        if (!url) return;

        const ok = window.confirm(
            `This will delete the file from Supabase Storage AND remove it from this card.\n\nContinue?`
        );
        if (!ok) return;

        setMessage("");
        setAssetBusy(key);

        try {
            await deleteAssetAndClearDb(form.id, key, url);

            // Clear locally so previews disappear immediately
            setForm((prev) => ({
                ...prev,
                layers: { ...prev.layers, [key]: "" },
            }));

            // Clear any selected upload file too
            if (key === "bg") setBgFile(null);
            if (key === "art") setArtFile(null);
            if (key === "frame") setFrameFile(null);
            if (key === "foilMask") setFoilMaskFile(null);
            if (key === "flatFoilMask") setFlatFoilMaskFile(null);

            setMessage(`Deleted ${key} file and removed it from the card.`);
            onSaved?.(); // optional refresh
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setAssetBusy("");
        }
    };

    useEffect(() => {
        const defaultParallax = { bg: -4, art: 6, foil: 8, flatFoil: 0, frame: 12, text: 14, foilOpacity: 0.75, flatFoilOpacity: 0.22 };
        const nextCard = editingCard
            ? {
                ...editingCard,
                layers: {
                    ...editingCard.layers,
                    parallax: { ...defaultParallax, ...editingCard.layers.parallax },
                },
            }
            : createEmptyCard();

        setForm(nextCard);
        setTagsInput((nextCard.tags ?? []).join(", "));

        setBgFile(null);
        setArtFile(null);
        setFrameFile(null);
        setFoilMaskFile(null);
        setFlatFoilMaskFile(null);

        setMessage("");
        setErrors({});
    }, [editingCard]);

    useEffect(() => {
        const nextBg = filePreviewUrl(bgFile);
        const nextArt = filePreviewUrl(artFile);
        const nextFrame = filePreviewUrl(frameFile);
        const nextFoil = filePreviewUrl(foilMaskFile);
        const nextFlat = filePreviewUrl(flatFoilMaskFile);

        setFlatFoilPreview(nextFlat);
        setBgPreview(nextBg);
        setArtPreview(nextArt);
        setFramePreview(nextFrame);
        setFoilPreview(nextFoil);

        return () => {
            if (nextBg) URL.revokeObjectURL(nextBg);
            if (nextArt) URL.revokeObjectURL(nextArt);
            if (nextFrame) URL.revokeObjectURL(nextFrame);
            if (nextFoil) URL.revokeObjectURL(nextFoil);
            if (nextFlat) URL.revokeObjectURL(nextFlat);
        };
    }, [bgFile, artFile, frameFile, foilMaskFile, flatFoilMaskFile]);

    const update = <K extends keyof Card>(key: K, value: Card[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
        if (key === "id" || key === "name" || key === "set") {
            setErrors((prev) => ({ ...prev, [key]: undefined }));
        }
    };

    const updateStats = (key: keyof NonNullable<Card["stats"]>, value: any) => {
        setForm((prev) => ({
            ...prev,
            stats: {
                ...prev.stats,
                [key]: value,
            },
        }));
    };

    const updateParallax = (key: keyof NonNullable<Card["layers"]["parallax"]>, value: number) => {
        setForm((prev) => ({
            ...prev,
            layers: {
                ...prev.layers,
                parallax: {
                    bg: -4, art: 6, foil: 8, flatFoil: 0, frame: 12, text: 14, foilOpacity: 0.75, flatFoilOpacity: 0.22,
                    ...prev.layers.parallax,
                    [key]: value,
                },
            },
        }));
    };

    const updateMove = (
        index: number,
        key: keyof NonNullable<Card["moves"]>[number],
        value: any
    ) => {
        setForm((prev) => ({
            ...prev,
            moves: (prev.moves ?? []).map((m, i) =>
                i === index ? { ...m, [key]: value } : m
            ),
        }));
    };

    const addMove = () => {
        setForm((prev) => ({
            ...prev,
            moves: [...(prev.moves ?? []), { ...blankMove }],
        }));
    };

    const removeMove = (index: number) => {
        setForm((prev) => ({
            ...prev,
            moves: (prev.moves ?? []).filter((_, i) => i !== index),
        }));
    };

    const resetForm = () => {
        setForm(createEmptyCard());
        setTagsInput("");
        setBgFile(null);
        setArtFile(null);
        setFrameFile(null);
        setFoilMaskFile(null);
        setFlatFoilMaskFile(null);
        setMessage("");
        setErrors({});
    };

    const validate = () => {
        const nextErrors: FormErrors = {};

        const trimmedId = form.id.trim();
        const trimmedName = form.name.trim();
        const trimmedSet = form.set.trim();

        if (!trimmedId) {
            nextErrors.id = "ID is required.";
        } else if (
            !isEditMode &&
            existingCards.some((c) => c.id.toLowerCase() === trimmedId.toLowerCase())
        ) {
            nextErrors.id = "This ID already exists.";
        }

        if (!trimmedName) {
            nextErrors.name = "Name is required.";
        }

        if (!trimmedSet) {
            nextErrors.set = "Set is required.";
        }

        if (!isEditMode) {
            if (!bgFile) nextErrors.bgFile = "Background file is required.";
            if (!artFile) nextErrors.artFile = "Art file is required.";
            if (!frameFile) nextErrors.frameFile = "Frame file is required.";
        }

        setErrors(nextErrors);
        return Object.keys(nextErrors).length === 0;
    };

    const clearAsset = (key: keyof Card["layers"]) => {
        setForm((prev) => ({
            ...prev,
            layers: {
                ...prev.layers,
                [key]: "",
            },
        }));
    };

    const clearAssetAndPreview = (key: keyof Card["layers"]) => {
        clearAsset(key);

        // clear the "new file" preview too (optional)
        if (key === "bg") setBgFile(null);
        if (key === "art") setArtFile(null);
        if (key === "frame") setFrameFile(null);
        if (key === "foilMask") setFoilMaskFile(null);
        if (key === "flatFoilMask") setFlatFoilMaskFile(null);
    };

    const submit = async () => {
        setMessage("");

        if (!validate()) {
            setMessage("Please fix the highlighted fields.");
            return;
        }

        const trimmedId = form.id.trim();
        const trimmedName = form.name.trim();
        const trimmedSet = form.set.trim();

        setLoading(true);

        try {
            const uploaded = await uploadCardAssets({
                cardId: trimmedId,
                bgFile,
                artFile,
                frameFile,
                foilMaskFile,
                flatFoilMaskFile,
            });

            const cleanCard: Card = {
                ...form,
                id: trimmedId,
                name: trimmedName,
                set: trimmedSet,
                artist: form.artist?.trim() || undefined,
                releaseDate: form.releaseDate?.trim() || undefined,
                lore: form.lore?.trim() || undefined,
                flavorText: form.flavorText?.trim() || undefined,
                number: form.number?.trim() || undefined,
                tags: tagsInput
                    .split(",")
                    .map((t) => t.trim())
                    .filter(Boolean),
                layers: {
                    bg: uploaded.bgUrl || form.layers.bg,
                    art: uploaded.artUrl || form.layers.art,
                    frame: uploaded.frameUrl || form.layers.frame,
                    foilMask: uploaded.foilMaskUrl || form.layers.foilMask,
                    flatFoilMask: uploaded.flatFoilMaskUrl || form.layers.flatFoilMask,
                    parallax: form.layers.parallax,
                },
                moves: (form.moves ?? []).filter((m) => m.name.trim() || m.text.trim()),
            };

            if (isEditMode) {
                await updateCardRow(cleanCard);
                setMessage(`Success! Card "${cleanCard.name}" updated.`);
            } else {
                await insertCardRow({
                    card: cleanCard,
                    bgUrl: cleanCard.layers.bg,
                    artUrl: cleanCard.layers.art,
                    frameUrl: cleanCard.layers.frame,
                    foilMaskUrl: cleanCard.layers.foilMask,
                });
                setMessage(`Success! Card "${cleanCard.name}" saved to Supabase.`);
                resetForm();
            }

            onSaved?.();
        } catch (err: any) {
            setMessage(`Error: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="rounded-3xl bg-white/5 p-6 ring-1 ring-white/10">
            <div className="mb-6">
                <h2 className="text-xl font-semibold">
                    {isEditMode ? `Edit card ${form.id}` : "Create card"}
                </h2>
                <p className="mt-2 text-sm text-zinc-300">
                    {isEditMode
                        ? "Update card details and optionally replace uploaded files."
                        : "This form uploads card files to Supabase Storage and saves the card data to the database."}
                </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
                <Field label="ID" error={errors.id}>
                    <input
                        value={form.id}
                        onChange={(e) => update("id", e.target.value)}
                        className={`input ${errors.id ? "input-error" : ""}`}
                        placeholder="005"
                        disabled={isEditMode}
                    />
                </Field>

                <Field label="Name" error={errors.name}>
                    <input
                        value={form.name}
                        onChange={(e) => update("name", e.target.value)}
                        className={`input ${errors.name ? "border-red-400/40" : ""}`}
                        placeholder="Card name"
                    />
                </Field>

                <Field label="Rarity">
                    <select
                        value={form.rarity}
                        onChange={(e) => update("rarity", e.target.value as Card["rarity"])}
                        className="input"
                    >
                        <option value="Common">Common</option>
                        <option value="Rare">Rare</option>
                        <option value="Ultra Rare">Ultra Rare</option>
                    </select>
                </Field>

                <Field label="Set" error={errors.set}>
                    <input
                        value={form.set}
                        onChange={(e) => update("set", e.target.value)}
                        className={`input ${errors.set ? "border-red-400/40" : ""}`}
                        placeholder="Set name"
                    />
                </Field>

                <Field label="Card number">
                    <input
                        value={form.number ?? ""}
                        onChange={(e) => update("number", e.target.value)}
                        className="input"
                        placeholder="005/120"
                    />
                </Field>

                <Field label="Card type">
                    <select
                        value={form.cardType ?? "Creature"}
                        onChange={(e) => update("cardType", e.target.value as Card["cardType"])}
                        className="input"
                    >
                        <option value="Creature">Creature</option>
                        <option value="Dragon">Dragon</option>
                        <option value="Mage">Mage</option>
                        <option value="Beast">Beast</option>
                        <option value="Guardian">Guardian</option>
                        <option value="Spirit">Spirit</option>
                        <option value="Warrior">Warrior</option>
                        <option value="Human">Human</option>
                    </select>
                </Field>

                <Field label="Artist">
                    <input
                        value={form.artist ?? ""}
                        onChange={(e) => update("artist", e.target.value)}
                        className="input"
                    />
                </Field>

                <Field label="Release date">
                    <input
                        type="date"
                        value={form.releaseDate ?? ""}
                        onChange={(e) => update("releaseDate", e.target.value)}
                        className="input"
                    />
                </Field>

                <Field label="Tags (comma separated)" className="sm:col-span-2">
                    <input
                        value={tagsInput}
                        onChange={(e) => setTagsInput(e.target.value)}
                        className="input"
                        placeholder="fire, support, human"
                    />
                </Field>

                <Field label="Lore" className="sm:col-span-2">
                    <textarea
                        value={form.lore ?? ""}
                        onChange={(e) => update("lore", e.target.value)}
                        className="input min-h-[110px]"
                    />
                </Field>

                <Field label="Flavor text" className="sm:col-span-2">
                    <textarea
                        value={form.flavorText ?? ""}
                        onChange={(e) => update("flavorText", e.target.value)}
                        className="input min-h-[90px]"
                    />
                </Field>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold">Stats</h3>
                <div className="mt-4 grid gap-4 sm:grid-cols-3">
                    <Field label="HP">
                        <input type="number" value={form.stats?.hp ?? 0} onChange={(e) => updateStats("hp", Number(e.target.value))} className="input" />
                    </Field>

                    <Field label="Element">
                        <select value={form.stats?.element ?? "Fire"} onChange={(e) => updateStats("element", e.target.value)} className="input">
                            <option value="Fire">Fire</option>
                            <option value="Water">Water</option>
                            <option value="Ice">Ice</option>
                            <option value="Electric">Electric</option>
                            <option value="Cosmic">Cosmic</option>
                            <option value="Earth">Earth</option>
                            <option value="Wind">Wind</option>
                            <option value="Dark">Dark</option>
                            <option value="Light">Light</option>
                        </select>
                    </Field>

                    <Field label="Retreat cost">
                        <input type="number" value={form.stats?.retreatCost ?? 0} onChange={(e) => updateStats("retreatCost", Number(e.target.value))} className="input" />
                    </Field>

                    <Field label="Attack">
                        <input type="number" value={form.stats?.attack ?? 0} onChange={(e) => updateStats("attack", Number(e.target.value))} className="input" />
                    </Field>

                    <Field label="Defense">
                        <input type="number" value={form.stats?.defense ?? 0} onChange={(e) => updateStats("defense", Number(e.target.value))} className="input" />
                    </Field>

                    <Field label="Speed">
                        <input type="number" value={form.stats?.speed ?? 0} onChange={(e) => updateStats("speed", Number(e.target.value))} className="input" />
                    </Field>

                    <Field label="Weakness">
                        <input value={form.stats?.weakness ?? ""} onChange={(e) => updateStats("weakness", e.target.value)} className="input" />
                    </Field>

                    <Field label="Resistance">
                        <input value={form.stats?.resistance ?? ""} onChange={(e) => updateStats("resistance", e.target.value)} className="input" />
                    </Field>
                </div>
            </div>

            <div className="mt-8">
                <div className="flex items-center justify-between gap-3">
                    <h3 className="text-lg font-semibold">Moves</h3>
                    <button type="button" onClick={addMove} className="rounded-full bg-white/10 px-3 py-1.5 text-sm text-white hover:bg-white/20">
                        Add move
                    </button>
                </div>

                <div className="mt-4 space-y-4">
                    {(form.moves ?? []).map((move, index) => (
                        <div key={index} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                            <div className="grid gap-4 sm:grid-cols-3">
                                <Field label="Move name">
                                    <input value={move.name} onChange={(e) => updateMove(index, "name", e.target.value)} className="input" />
                                </Field>

                                <Field label="Cost">
                                    <input type="number" value={move.cost ?? 0} onChange={(e) => updateMove(index, "cost", Number(e.target.value))} className="input" />
                                </Field>

                                <Field label="Damage">
                                    <input type="number" value={move.damage ?? 0} onChange={(e) => updateMove(index, "damage", Number(e.target.value))} className="input" />
                                </Field>
                            </div>

                            <Field label="Description" className="mt-4">
                                <textarea value={move.text} onChange={(e) => updateMove(index, "text", e.target.value)} className="input min-h-[90px]" />
                            </Field>

                            {(form.moves?.length ?? 0) > 1 && (
                                <button type="button" onClick={() => removeMove(index)} className="mt-4 rounded-full bg-red-500/15 px-3 py-1.5 text-sm text-red-200 hover:bg-red-500/25">
                                    Remove move
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold">Parallax Offsets</h3>
                <p className="mt-1 text-xs text-zinc-400">
                    Controls how much each layer shifts during the 3D tilt effect. Negative = pushes back, positive = pops forward.
                </p>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {(([
                        { key: "bg", label: "Background", default: -4, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "art", label: "Art", default: 6, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "foil", label: "Foil", default: 8, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "flatFoil", label: "Flat Foil", default: 0, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "frame", label: "Frame", default: 12, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "text", label: "Text", default: 14, min: -20, max: 20, step: 1, fmt: (v: number) => String(v) },
                        { key: "foilOpacity", label: "Foil Opacity", default: 0.75, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2) },
                        { key: "flatFoilOpacity", label: "Flat Foil Opacity", default: 0.22, min: 0, max: 1, step: 0.01, fmt: (v: number) => v.toFixed(2) },
                    ] as Array<{
                        key: keyof NonNullable<Card["layers"]["parallax"]>;
                        label: string;
                        default: number;
                        min: number;
                        max: number;
                        step: number;
                        fmt: (v: number) => string;
                    }>)).map(({ key, label, default: def, min, max, step, fmt }) => {
                        const val = form.layers.parallax?.[key] ?? def;
                        return (
                            <div key={key} className="rounded-2xl bg-white/5 p-4 ring-1 ring-white/10">
                                <div className="mb-2 flex items-center justify-between">
                                    <label className="text-xs text-zinc-300">{label}</label>
                                    <span className="w-12 text-right text-xs font-mono text-zinc-200">{fmt(val)}</span>
                                </div>
                                <input
                                    type="range"
                                    min={min}
                                    max={max}
                                    step={step}
                                    value={val}
                                    onChange={(e) => updateParallax(key, Number(e.target.value))}
                                    className="w-full accent-cyan-400"
                                />
                                <div className="mt-1 flex justify-between text-[10px] text-zinc-500">
                                    <span>{min}</span>
                                    <button
                                        type="button"
                                        onClick={() => updateParallax(key, def)}
                                        className="text-zinc-400 hover:text-zinc-200"
                                        title="Reset to default"
                                    >
                                        reset ({fmt(def)})
                                    </button>
                                    <span>{max}</span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="mt-8">
                <h3 className="text-lg font-semibold">Files</h3>
                {isEditMode && (
                    <p className="mt-2 text-sm text-zinc-400">
                        Leave a file empty if you want to keep the current uploaded file.
                    </p>
                )}

                <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Background file" error={errors.bgFile}>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setBgFile(e.target.files?.[0] ?? null);
                                    setErrors((prev) => ({ ...prev, bgFile: undefined }));
                                }}
                                className={`input flex-1 ${errors.bgFile ? "border-red-400/40" : ""}`}
                            />

                            {isEditMode && form.layers.bg ? (
                                <button
                                    type="button"
                                    onClick={() => deleteAsset("bg")}
                                    disabled={assetBusy === "bg"}
                                    className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200 hover:bg-red-500/25"
                                    title="Remove background URL from this card"
                                >
                                    {assetBusy === "bg" ? "Removing..." : "Remove"}
                                </button>
                            ) : null}
                        </div>
                    </Field>

                    <Field label="Art file" error={errors.artFile}>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    setArtFile(e.target.files?.[0] ?? null);
                                    setErrors((prev) => ({ ...prev, artFile: undefined }));
                                }}
                                className={`input flex-1 ${errors.artFile ? "border-red-400/40" : ""}`}
                            />

                            {isEditMode && form.layers.art ? (
                                <button
                                    type="button"
                                    onClick={() => deleteAsset("art")}
                                    disabled={assetBusy === "art"}
                                    className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200 hover:bg-red-500/25"
                                    title="Remove art URL from this card"
                                >
                                    {assetBusy === "art" ? "Removing..." : "Remove"}
                                </button>
                            ) : null}
                        </div>
                    </Field>

                    <Field label="Frame file" error={errors.frameFile}>
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*,.svg"
                                onChange={(e) => {
                                    setFrameFile(e.target.files?.[0] ?? null);
                                    setErrors((prev) => ({ ...prev, frameFile: undefined }));
                                }}
                                className={`input flex-1 ${errors.frameFile ? "border-red-400/40" : ""}`}
                            />

                            {isEditMode && form.layers.frame ? (
                                <button
                                    type="button"
                                    onClick={() => deleteAsset("frame")}
                                    disabled={assetBusy === "frame"}
                                    className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200 hover:bg-red-500/25"
                                    title="Remove frame URL from this card"
                                >
                                    {assetBusy === "frame" ? "Removing..." : "Remove"}
                                </button>
                            ) : null}
                        </div>
                    </Field>

                    <Field label="Foil mask file (optional)">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFoilMaskFile(e.target.files?.[0] ?? null)}
                                className="input flex-1"
                            />

                            {isEditMode && form.layers.foilMask ? (
                                <button
                                    type="button"
                                    onClick={() => deleteAsset("foilMask")}
                                    disabled={assetBusy === "foilMask"}
                                    className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200 hover:bg-red-500/25"
                                    title="Remove foil mask URL from this card"
                                >
                                    {assetBusy === "foilMask" ? "Removing..." : "Remove"}
                                </button>
                            ) : null}
                        </div>
                    </Field>
                    <Field label="Flat foil mask file (optional)">
                        <div className="flex items-center gap-2">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => setFlatFoilMaskFile(e.target.files?.[0] ?? null)}
                                className="input flex-1"
                            />

                            {isEditMode && form.layers.flatFoilMask ? (
                                <button
                                    type="button"
                                    onClick={() => deleteAsset("flatFoilMask")}
                                    disabled={assetBusy === "flatFoilMask"}
                                    className="rounded-xl bg-red-500/15 px-3 py-2 text-xs text-red-200 hover:bg-red-500/25"
                                    title="Remove flat foil mask URL from this card"
                                >
                                    {assetBusy === "flatFoilMask" ? "Removing..." : "Remove"}
                                </button>
                            ) : null}
                        </div>
                    </Field>
                </div>

                {(isEditMode || bgPreview || artPreview || framePreview || foilPreview) && (
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        <AssetPreview title="Background" currentUrl={form.layers.bg} previewUrl={bgPreview} />
                        <AssetPreview title="Art" currentUrl={form.layers.art} previewUrl={artPreview} />
                        <AssetPreview title="Frame" currentUrl={form.layers.frame} previewUrl={framePreview} />
                        <AssetPreview title="Foil Mask" currentUrl={form.layers.foilMask} previewUrl={foilPreview} />
                        <AssetPreview title="Flat Foil Mask" currentUrl={form.layers.flatFoilMask} previewUrl={flatFoilPreview} />
                    </div>
                )}
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
                <button
                    type="button"
                    onClick={submit}
                    disabled={loading}
                    className="rounded-xl bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20 disabled:opacity-60"
                >
                    {loading
                        ? isEditMode
                            ? "Updating..."
                            : "Saving..."
                        : isEditMode
                            ? "Update card"
                            : "Save card to Supabase"}
                </button>

                {isEditMode ? (
                    <button
                        type="button"
                        onClick={onCancelEdit}
                        className="rounded-xl bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                    >
                        Cancel edit
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={resetForm}
                        className="rounded-xl bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                    >
                        Clear form
                    </button>
                )}

                <a
                    href="/"
                    className="rounded-xl bg-white/5 px-4 py-2 text-sm text-zinc-200 hover:bg-white/10"
                >
                    Cancel
                </a>
            </div>

            {message ? <p className="mt-4 text-sm text-zinc-300">{message}</p> : null}
        </div>
    );
}

function Field({
    label,
    children,
    className,
    error,
}: {
    label: string;
    children: React.ReactNode;
    className?: string;
    error?: string;
}) {
    return (
        <div className={className}>
            <label className="mb-1 block text-xs text-zinc-300">{label}</label>
            {children}
            {error ? <p className="field-error mt-1 text-sm font-medium">{error}</p> : null}
        </div>
    );
}

function AssetPreview({
    title,
    currentUrl,
    previewUrl,
}: {
    title: string;
    currentUrl?: string;
    previewUrl?: string;
}) {
    const shownUrl = previewUrl || currentUrl;

    return (
        <div className="rounded-2xl bg-black/20 p-3 ring-1 ring-white/10">
            <div className="mb-2 text-xs text-zinc-300">{title}</div>

            {shownUrl ? (
                <>
                    <div className="mb-2 text-[11px] text-zinc-400">
                        {previewUrl ? "New selected file preview" : "Current uploaded file"}
                    </div>
                    <img
                        src={shownUrl}
                        alt={title}
                        className="h-36 w-full rounded-xl object-cover bg-black/30"
                    />
                </>
            ) : (
                <div className="flex h-36 items-center justify-center rounded-xl bg-black/30 text-xs text-zinc-500">
                    No file
                </div>
            )}
        </div>
    );
}