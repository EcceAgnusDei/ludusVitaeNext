"use client";

import { useEffect, useRef } from "react";

import { Button } from "@/components/ui/button";

import { SavedGridsGallery } from "./saved-grids-gallery";
import { useGridsSource } from "../use-grids-source";

export type GridsExploreVariant = "recent" | "popular";

export type GridsExploreProps = { variant: GridsExploreVariant };

export function GridsExplore({ variant }: GridsExploreProps) {
  const sort = variant === "popular" ? "popular" : "recent";
  const { grids, error, loading, loadMore, hasMore } = useGridsSource({
    kind: "explore",
    sort,
  });

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const galleryLoadError = grids === null ? error : null;
  const loadMoreError = grids !== null ? error : null;
  const loadingMore = grids !== null && loading;

  useEffect(() => {
    if (!hasMore) return;
    const el = sentinelRef.current;
    if (el === null) return;
    const obs = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { root: null, rootMargin: "500px", threshold: 0 },
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [hasMore, loadMore]);

  if (grids === null) {
    return (
      <div className="flex w-full min-w-0 flex-1 flex-col items-center justify-center p-6">
        {error !== null ? (
          <p className="text-destructive text-sm">{error}</p>
        ) : (
          <p className="text-muted-foreground">Chargement des grilles…</p>
        )}
      </div>
    );
  }

  return (
    <div
      className="flex w-full min-w-0 flex-1 flex-col gap-6 p-6"
      aria-busy={loadingMore}
    >
      <SavedGridsGallery
        grids={grids}
        loadError={galleryLoadError}
        emptyMessage="Aucune grille pour le moment."
        showCreator
      />

      {loadMoreError !== null ? (
        <div className="flex flex-col items-center gap-2 py-2">
          <p className="text-center text-sm text-destructive">
            {loadMoreError}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              void loadMore();
            }}
          >
            Réessayer
          </Button>
        </div>
      ) : null}

      {loadingMore ? (
        <p className="text-muted-foreground text-center text-sm">
          Chargement de la suite…
        </p>
      ) : null}

      {hasMore ? (
        <div
          ref={sentinelRef}
          className="pointer-events-none h-2 w-full shrink-0"
          aria-hidden
        />
      ) : null}
    </div>
  );
}
