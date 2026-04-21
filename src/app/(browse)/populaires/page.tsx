import { GridsExplore } from "@/features/grids/components/grids-explore";
import { GridsExploreStaticIntro } from "@/features/grids/components/grids-explore-static-intro";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata({
  path: "/populaires",
  titleSegment: "Créations populaires",
  description: `Découvrez les créations les plus aimées.`,
});

export default function PopulairesPage() {
  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <GridsExploreStaticIntro variant="popular" />
      <GridsExplore variant="popular" />
    </main>
  );
}
