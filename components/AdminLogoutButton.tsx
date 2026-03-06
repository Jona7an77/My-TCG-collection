"use client";

import { createClient } from "@/lib/supabase/client";

export default function AdminLogoutButton() {
    const supabase = createClient();

    const logout = async () => {
        await supabase.auth.signOut();
        window.location.href = "/login";
    };

    return (
        <button
            type="button"
            onClick={logout}
            className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
        >
            Sign out
        </button>
    );
}