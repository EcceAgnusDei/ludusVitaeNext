import type { Metadata } from "next";

import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";

export const metadata: Metadata = {
  title: "Mon espace — J’aime | Ludus Vitae",
  description: "Grilles que vous avez aimées.",
};

export default function MonEspaceAimeesPage() {
  return <MonEspaceTabPanel variant="likes" />;
}
