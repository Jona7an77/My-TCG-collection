"use client";

/**
 * StarfieldBg – fixed full-screen animated background.
 *
 * - Dots:  pure CSS repeating radial-gradient → perfectly uniform tiny dot grid.
 * - Blobs: two blurred divs (blue-indigo + violet-magenta) that drift independently.
 */
export default function StarfieldBg() {
    return (
        <div
            aria-hidden
            className="hidden sm:block pointer-events-none fixed inset-0 -z-10 overflow-hidden"
        >
            {/* Uniform dot grid */}
            <div className="starfield-dots absolute inset-0" />

            {/* Blue-indigo glow – bottom-left */}
            <div className="starfield-blob starfield-blob-blue" />

            {/* Violet-magenta glow – bottom-right */}
            <div className="starfield-blob starfield-blob-violet" />
        </div>
    );
}
