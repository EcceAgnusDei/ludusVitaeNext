import type { Metadata } from "next";

import { GamePageClient } from "@/features/game/components/game-page-client";

export const metadata: Metadata = {
  title: "Jeu | Ludus Vitae",
  description: "Automate cellulaire — éditez, lisez et enregistrez vos grilles.",
};

export default function JeuPage() {
  return <GamePageClient />;
}
