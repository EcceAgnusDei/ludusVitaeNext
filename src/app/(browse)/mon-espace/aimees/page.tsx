import { MonEspaceTabPanel } from "@/features/grids/components/mon-espace-tab-panel";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata({
    path: "/mon-espace/aimees",
    titleSegment: "Mon espace — J’aime",
    description: `Les créations que vous avez aimées.`,
  }),
  robots: { index: false, follow: true },
};

export default function MonEspaceAimeesPage() {
  return <MonEspaceTabPanel variant="likes" />;
}
