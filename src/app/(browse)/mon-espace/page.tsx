import type { Metadata } from "next";

import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";

export const metadata: Metadata = {
  title: "Mon espace | Ludus Vitae",
  description:
    "Vos grilles enregistrées et les grilles que vous avez aimées.",
};

export default function MonEspacePage() {
  return <MonEspaceTabPanel variant="recent" />;
}
