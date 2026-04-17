import type { Metadata } from "next";

import { GridsExplore } from "@/features/grids/components/grids-explore";

export const metadata: Metadata = {
  title: "Récents | Ludus Vitae",
  description:
    "Toutes les grilles publiques, de la plus récente à la plus ancienne.",
};

export default function RecentsPage() {
  return <GridsExplore variant="recent" />;
}
