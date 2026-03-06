import FavoritesPageClient from "@/components/FavoritesPageClient";
import { getAllCardsMerged } from "@/lib/cards-db";

export default async function FavoritesPage() {
  const cards = await getAllCardsMerged();

  return <FavoritesPageClient initialCards={cards} />;
}