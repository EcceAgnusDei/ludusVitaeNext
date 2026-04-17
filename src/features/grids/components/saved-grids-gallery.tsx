"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Eye, EyeOff, Heart, Trash2 } from "lucide-react";

import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PLAY_GRID_SESSION_STORAGE_KEY } from "@/features/game/lib/play-navigation-payload";

import { DeleteGridDialog } from "./delete-grid-dialog";
import { GridThumbnail } from "./grid-thumbnail";
import type { SavedGrid } from "@/features/grids/lib/saved-grid";

export type SavedGridsGalleryProps = {
  grids: SavedGrid[];
  loadError: string | null;
  emptyMessage: string;
  showCreator?: boolean;
};

const cardShellClass =
  "relative flex w-full min-w-0 flex-col items-center gap-2 rounded-md outline-offset-2 transition-transform duration-200 ease-out hover:scale-[1.04]";

const cardLinkClass =
  "flex w-full min-w-0 flex-col items-center gap-2 rounded-md p-1 text-foreground no-underline focus-visible:z-[1] focus-visible:outline focus-visible:outline-2 focus-visible:outline-ring";

function savedGridIsPublic(g: Pick<SavedGrid, "isPublic">): boolean {
  return g.isPublic !== false;
}

type GridCardToolbarProps = {
  gridId: string;
  isPublicInitial: boolean;
  likedInitial: boolean;
  likeCountInitial: number;
  isOwner: boolean;
  onRemoved?: () => void;
  onVisibilityUpdated?: (isPublic: boolean) => void;
};

function GridCardToolbar({
  gridId,
  isPublicInitial,
  likedInitial,
  likeCountInitial,
  isOwner,
  onRemoved,
  onVisibilityUpdated,
}: GridCardToolbarProps) {
  const { data: session, isPending: sessionPending } = authClient.useSession();
  const [isPublic, setIsPublic] = useState(isPublicInitial);
  const [liked, setLiked] = useState(likedInitial);
  const [likeCount, setLikeCount] = useState(likeCountInitial);
  const [likePending, setLikePending] = useState(false);
  const [visibilityPending, setVisibilityPending] = useState(false);
  const [deletePending, setDeletePending] = useState(false);
  const [deleteGridDialogOpen, setDeleteGridDialogOpen] = useState(false);

  useEffect(() => {
    setIsPublic(isPublicInitial);
  }, [gridId, isPublicInitial]);

  useEffect(() => {
    setLiked(likedInitial);
    setLikeCount(likeCountInitial);
  }, [gridId, likedInitial, likeCountInitial]);

  const showLike = !sessionPending && session?.user != null;
  const showDelete = isOwner && !sessionPending && session?.user != null;

  if (!showLike && !showDelete) return null;

  const toggleLike = async () => {
    if (likePending) return;
    setLikePending(true);
    try {
      const method = liked ? "DELETE" : "POST";
      const res = await fetch(
        `/api/grids/${encodeURIComponent(gridId)}/like`,
        { method, credentials: "include" },
      );
      if (!res.ok) return;
      const body = (await res.json()) as {
        liked?: unknown;
        likeCount?: unknown;
      };
      if (
        typeof body.liked === "boolean" &&
        typeof body.likeCount === "number"
      ) {
        setLiked(body.liked);
        setLikeCount(body.likeCount);
      }
    } finally {
      setLikePending(false);
    }
  };

  const deleteGrid = async () => {
    if (deletePending) return;
    setDeletePending(true);
    try {
      const res = await fetch(`/api/grids/${encodeURIComponent(gridId)}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) return;
      setDeleteGridDialogOpen(false);
      onRemoved?.();
    } catch {
      /* ignore */
    } finally {
      setDeletePending(false);
    }
  };

  const toggleVisibility = async () => {
    if (visibilityPending) return;
    const next = !isPublic;
    setVisibilityPending(true);
    try {
      const res = await fetch(`/api/grids/${encodeURIComponent(gridId)}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isPublic: next }),
      });
      if (!res.ok) {
        let detail = "";
        try {
          const text = await res.text();
          if (text) {
            const parsed = JSON.parse(text) as { error?: unknown };
            if (typeof parsed.error === "string") detail = parsed.error;
          }
        } catch {
          /* ignore */
        }
        console.error(
          "Visibilité grille : échec API",
          res.status,
          detail || "(pas de détail)",
        );
        return;
      }
      setIsPublic(next);
      onVisibilityUpdated?.(next);
    } catch {
      /* ignore */
    } finally {
      setVisibilityPending(false);
    }
  };

  return (
    <>
      <div className="pointer-events-none absolute top-1 right-1 z-[2] flex items-center gap-1">
        {showDelete ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="pointer-events-auto border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm"
              disabled={visibilityPending}
              aria-pressed={isPublic}
              aria-label={
                isPublic
                  ? "Rendre cette grille privée"
                  : "Rendre cette grille publique"
              }
              onClick={() => void toggleVisibility()}
            >
              {isPublic ? (
                <Eye className="size-4" aria-hidden />
              ) : (
                <EyeOff className="size-4" aria-hidden />
              )}
            </Button>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="pointer-events-auto border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm"
              disabled={deletePending}
              aria-label="Supprimer cette grille"
              onClick={() => setDeleteGridDialogOpen(true)}
            >
              <Trash2 className="size-4" aria-hidden />
            </Button>
            <DeleteGridDialog
              open={deleteGridDialogOpen}
              onOpenChange={setDeleteGridDialogOpen}
              title="Supprimer cette grille ?"
              description="Cette action est irréversible. La grille sera définitivement supprimée."
              pending={deletePending}
              onConfirm={() => void deleteGrid()}
            />
          </>
        ) : null}
        {showLike ? (
          <>
            <Button
              type="button"
              variant="secondary"
              size="icon-sm"
              className="pointer-events-auto border border-border/80 bg-background/90 shadow-sm backdrop-blur-sm"
              disabled={likePending}
              aria-pressed={liked}
              aria-label={
                liked ? "Ne plus aimer cette grille" : "Aimer cette grille"
              }
              onClick={() => {
                void toggleLike();
              }}
            >
              <Heart
                className={cn(liked && "fill-destructive text-destructive")}
                aria-hidden
              />
            </Button>
            <span
              className="pointer-events-auto min-w-6 rounded-md border border-border/80 bg-background/90 px-1.5 py-0.5 text-center text-xs font-medium tabular-nums shadow-sm backdrop-blur-sm"
              aria-live="polite"
            >
              {likeCount}
            </span>
          </>
        ) : null}
      </div>
    </>
  );
}

function stashPlayPayload(data: unknown) {
  try {
    sessionStorage.setItem(
      PLAY_GRID_SESSION_STORAGE_KEY,
      JSON.stringify(data),
    );
  } catch {
    /* ignore */
  }
}

export function SavedGridsGallery({
  grids,
  loadError,
  emptyMessage,
  showCreator = false,
}: SavedGridsGalleryProps) {
  const { data: session } = authClient.useSession();
  const viewerUserId = session?.user?.id ?? null;

  const [items, setItems] = useState(grids);

  useEffect(() => {
    setItems(grids);
  }, [grids]);

  return (
    <>
      {loadError ? (
        <p className="text-destructive text-sm" role="alert">
          {loadError}
        </p>
      ) : null}

      {items.length === 0 && !loadError ? (
        <p className="text-muted-foreground text-sm">{emptyMessage}</p>
      ) : null}

      <ul className="grid min-w-0 list-none gap-8 p-0 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((g) => {
          const name = g.name?.trim();
          const creator = g.creatorName?.trim();
          let label =
            name != null && name.length > 0
              ? `Ouvrir la grille « ${name} » dans Jouer`
              : "Ouvrir cette grille dans Jouer";
          if (showCreator && creator != null && creator.length > 0) {
            label = `${label}, par ${creator}`;
          }

          const isOwner = viewerUserId != null && g.userId === viewerUserId;

          return (
            <li key={g.id} className={cardShellClass}>
              <Link
                href="/jeu"
                className={cardLinkClass}
                aria-label={label}
                onClick={() => stashPlayPayload(g.data)}
              >
                <GridThumbnail
                  gridId={g.id}
                  data={g.data}
                  caption={showCreator ? name : undefined}
                  showCreator={showCreator}
                  creatorName={g.creatorName}
                />
                {!showCreator && name ? (
                  <p className="text-foreground w-full max-w-full truncate text-center text-sm font-medium">
                    {name}
                  </p>
                ) : null}
              </Link>
              <GridCardToolbar
                gridId={g.id}
                isPublicInitial={savedGridIsPublic(g)}
                likedInitial={g.likedByMe ?? false}
                likeCountInitial={g.likeCount ?? 0}
                isOwner={isOwner}
                onRemoved={() =>
                  setItems((prev) => prev.filter((row) => row.id !== g.id))
                }
                onVisibilityUpdated={(next) =>
                  setItems((prev) =>
                    prev.map((row) =>
                      row.id === g.id ? { ...row, isPublic: next } : row,
                    ),
                  )
                }
              />
            </li>
          );
        })}
      </ul>
    </>
  );
}
