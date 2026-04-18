import type { Metadata } from "next";

import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";

export const metadata: Metadata = {
  title: "Mon espace — Populaires | Ludus Vitae",
  description: "Vos grilles de la plus populaire à la moins populaire.",
};

export default function MonEspacePopulairesPage() {
  return <MonEspaceTabPanel variant="popular" />;
}
