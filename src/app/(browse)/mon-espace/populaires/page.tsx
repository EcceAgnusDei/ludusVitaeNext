import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata({
    path: "/mon-espace/populaires",
    titleSegment: "Vos créations populaires",
    description:
      "Vos créations, triées de la plus populaire à la moins populaire.",
  }),
  robots: { index: false, follow: true },
};

export default function MonEspacePopulairesPage() {
  return <MonEspaceTabPanel variant="popular" />;
}
