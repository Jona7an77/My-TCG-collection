import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminLogoutButton from "@/components/AdminLogoutButton";
import AdminPageClient from "@/components/AdminPageClient";
import { getSupabaseCards } from "@/lib/cards-db";

export default async function AdminPage() {
    const supabase = await createClient();

    const {
        data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
        redirect("/login");
    }

    const savedCards = await getSupabaseCards();

    return (
        <main className="mx-auto max-w-5xl px-5 py-10">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-3xl font-semibold">Admin</h1>
                    <p className="mt-2 text-zinc-300">
                        You are signed in as {user.email}
                    </p>
                </div>

                <div className="flex flex-wrap gap-2">
                    <a
                        href="/"
                        className="rounded-full bg-white/10 px-3 py-2 text-sm text-white hover:bg-white/20"
                    >
                        Back to collection
                    </a>

                    <AdminLogoutButton />
                </div>
            </div>

            <AdminPageClient initialCards={savedCards} />
        </main>
    );
}