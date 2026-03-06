import HomePageClient from "@/components/HomePageClient";
import { getAllCardsMerged } from "@/lib/cards-db";

export default async function HomePage() {
  const cards = await getAllCardsMerged();

  return <HomePageClient initialCards={cards} />;
}