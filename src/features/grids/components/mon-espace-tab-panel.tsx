"use client";

import { authClient } from "@/lib/auth-client";

import { useGridsSource } from "../use-grids-source";
import { SavedGridsGallery } from "./saved-grids-gallery";

export type MonEspaceVariant = "recent" | "popular" | "likes";

const DESCRIPTIONS: Record<MonEspaceVariant, string> = {
  recent: "Vos grilles, de la plus récente à la plus ancienne.",
  popular: "Vos grilles de la plus populaire à la moins populaire.",
  likes: "Grilles que vous avez aimées.",
};

const emptyMessages: Record<MonEspaceVariant, string> = {
  recent:
    "Aucune grille enregistrée. Enregistrez-en une depuis la page Jouer.",
  popular:
    "Aucune grille enregistrée. Enregistrez-en une depuis la page Jouer.",
  likes:
    "Vous n’avez pas encore aimé de grille. Explorez Récents ou Populaires.",
};

export type MonEspaceTabPanelProps = { variant: MonEspaceVariant };

export function MonEspaceTabPanel({ variant }: MonEspaceTabPanelProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const userId = session?.user?.id;

  const options =
    variant === "likes"
      ? ({ kind: "likes" } as const)
      : ({
          kind: "user",
          userId: userId ?? "",
          sort: variant === "popular" ? "popular" : "recent",
        } as const);

  const { grids, error } = useGridsSource(options);

  if (sessionPending || (variant !== "likes" && !userId)) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Chargement de vos grilles…
      </p>
    );
  }

  if (grids === null) {
    return (
      <p className="text-sm text-muted-foreground text-center">
        Chargement de vos grilles…
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <p className="text-sm text-muted-foreground text-center">
        {DESCRIPTIONS[variant]}
      </p>
      <SavedGridsGallery
        grids={grids}
        loadError={error}
        emptyMessage={emptyMessages[variant]}
        showCreator={variant === "likes"}
      />
    </div>
  );
}
