import { GamePageClient } from "@/features/game/components/game-page-client";
import { JeuStaticIntro } from "@/features/game/components/jeu-static-intro";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = pageMetadata({
  path: "/jeu",
  titleSegment: "Jeu",
  description:
    "Automate cellulaire — créez, simulez, enregistrez et partagez vos créations en ligne.",
});

export default function JeuPage() {
  return (
    <main className="flex min-h-0 min-w-0 w-full flex-1 flex-col">
      <JeuStaticIntro />
      <GamePageClient />
    </main>
  );
}
