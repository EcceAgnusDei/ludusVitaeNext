import type { Metadata } from "next";

import { GridsExplore } from "@/features/grids/components/grids-explore";

export const metadata: Metadata = {
  title: "Populaires | Ludus Vitae",
  description: "Grilles publiques les plus aimées.",
};

export default function PopulairesPage() {
  return <GridsExplore variant="popular" />;
}
