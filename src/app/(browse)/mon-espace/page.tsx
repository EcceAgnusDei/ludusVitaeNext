import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata({
    path: "/mon-espace",
    titleSegment: "Mon espace",
    description: `Gérez vos créations.`,
  }),
  robots: { index: false, follow: true },
};

export default function MonEspacePage() {
  return <MonEspaceTabPanel variant="recent" />;
}
