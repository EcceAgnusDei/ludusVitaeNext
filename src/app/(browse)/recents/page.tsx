import { GridsExplore } from "@/features/grids/components/grids-explore";
import { GridsExploreStaticIntro } from "@/features/grids/components/grids-explore-static-intro";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata({
  path: "/recents",
  titleSegment: "Créations récentes",
  description: `Parcourez les créations les plus récentes.`,
});

export default function RecentsPage() {
  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <GridsExploreStaticIntro variant="recent" />
      <GridsExplore variant="recent" />
    </main>
  );
}
