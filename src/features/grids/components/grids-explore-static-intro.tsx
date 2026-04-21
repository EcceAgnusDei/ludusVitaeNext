export type GridsExploreStaticVariant = "recent" | "popular";

const COPY = {
  recent: {
    id: "recents-intro",
    h1: "Créations récentes",
    lead: "Les créations paratagées par la communauté, des plus récentes aux plus anciennes. Cliquez dessus pour la rejouer dans le simulateur.",
  },
  popular: {
    id: "populaires-intro",
    h1: "Créations populaires",
    lead: "Les créations les plus aimées. Cliquez dessus pour la rejouer dans le simulateur.",
  },
} as const satisfies Record<
  GridsExploreStaticVariant,
  { id: string; h1: string; lead: string }
>;

export function GridsExploreStaticIntro({
  variant,
}: {
  variant: GridsExploreStaticVariant;
}) {
  const { id, h1, lead } = COPY[variant];

  return (
    <header className="border-border w-full shrink-0 border-b px-6 py-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3 text-center">
        <h1 id={id} className="text-2xl font-semibold tracking-tight">
          {h1}
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
          {lead}
        </p>
      </div>
    </header>
  );
}
