"use client";

import { Fragment } from "react";
import { ChevronDownIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { MAX_GRID_CELLS } from "@/features/game/lib/grid-command";
import type { GridPlaySnapshot } from "@/features/game/lib/grid-handle-snapshot";
import {
  KNOWN_GAME_OF_LIFE_PATTERNS,
  KNOWN_PATTERN_CATEGORY_LABEL,
  type KnownGameOfLifePattern,
  type KnownPatternCategory,
} from "@/features/game/lib/known-patterns";
import { GRID_AI_PROMPT_MAX_LENGTH } from "@/features/game/lib/post-grid-ai-command";

export { MAX_GRID_CELLS };

type GameToolbarProps = {
  playing: boolean;
  onPlayToggle: () => void;
  onStep: () => void;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onClearAllLiving: () => void;
  onSpeedChange: (value: number) => void;
  gridSizeInputs: { x: string; y: string };
  onGridSizeInputChange: (field: "x" | "y", value: string) => void;
  onApplyGridSize: () => void;
  cellSizeInput: string;
  onCellSizeInputChange: (value: string) => void;
  onApplyCellSize: () => void;
  gridAiEnabled: boolean;
  gridAiSessionPending: boolean;
  gridAiPrompt: string;
  onGridAiPromptChange: (value: string) => void;
  onGridAiSubmit: () => void;
  gridAiSubmitting: boolean;
  onSaveLocal: () => void;
  onLoadLocal: () => void;
  onLoadKnownPattern: (snapshot: GridPlaySnapshot) => void;
  showSaveToDb: boolean;
  onOpenSaveDb: () => void;
  updateGridId: string | null;
  onUpdateGrid: () => void;
  updateGridPending: boolean;
};

export function GameToolbar({
  playing,
  onPlayToggle,
  onStep,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onClearAllLiving,
  onSpeedChange,
  gridSizeInputs,
  onGridSizeInputChange,
  onApplyGridSize,
  cellSizeInput,
  onCellSizeInputChange,
  onApplyCellSize,
  gridAiEnabled,
  gridAiSessionPending,
  gridAiPrompt,
  onGridAiPromptChange,
  onGridAiSubmit,
  gridAiSubmitting,
  onSaveLocal,
  onLoadLocal,
  onLoadKnownPattern,
  showSaveToDb,
  onOpenSaveDb,
  updateGridId,
  onUpdateGrid,
  updateGridPending,
}: GameToolbarProps) {
  const patternMenuSections: {
    category: KnownPatternCategory;
    items: KnownGameOfLifePattern[];
  }[] = [];
  let currentCategory: KnownPatternCategory | null = null;
  let currentItems: KnownGameOfLifePattern[] = [];
  for (const p of KNOWN_GAME_OF_LIFE_PATTERNS) {
    if (p.category !== currentCategory) {
      if (currentCategory !== null) {
        patternMenuSections.push({
          category: currentCategory,
          items: currentItems,
        });
      }
      currentCategory = p.category;
      currentItems = [p];
    } else {
      currentItems.push(p);
    }
  }
  if (currentCategory !== null) {
    patternMenuSections.push({ category: currentCategory, items: currentItems });
  }

  return (
    <div className="mx-auto flex w-full max-w-[min(28rem,100%)] flex-col gap-4 md:max-w-[min(64rem,100%)] md:flex-row md:items-start md:justify-center md:gap-8">
      <div className="flex w-full min-w-0 flex-1 flex-col items-center gap-4">
        <div className="flex w-full flex-col gap-2">
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={playing || !canUndo}
              onClick={onUndo}
              title={
                playing
                  ? "Mettez en pause pour annuler"
                  : "Revenir à l’état précédent (play, pas, chargement, IA)"
              }
            >
              Annuler
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={playing || !canRedo}
              onClick={onRedo}
              title={
                playing
                  ? "Mettez en pause pour refaire"
                  : "Rétablir l’état annulé"
              }
            >
              Refaire
            </Button>
            <Button
              type="button"
              variant="outline"
              disabled={playing}
              onClick={onClearAllLiving}
              aria-label="Remet à 0"
              title={
                playing ? "Mettez en pause pour vider la grille" : "Remet à 0"
              }
            >
              Reset
            </Button>
          </div>
          <div className="flex w-full flex-wrap items-center justify-center gap-x-3 gap-y-2">
            <label className="flex min-w-[min(12rem,100%)] max-w-full flex-1 items-center gap-2 text-sm sm:min-w-[14rem]">
              <span className="shrink-0">Vitesse</span>
              <input
                type="range"
                min={1}
                max={100}
                defaultValue={1}
                className="min-w-0 flex-1"
                onInput={(e) => onSpeedChange(Number(e.currentTarget.value))}
              />
            </label>
            <Button type="button" onClick={onPlayToggle}>
              {playing ? "Pause" : "Play"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={playing}
              onClick={onStep}
              aria-label="Avancer d'une génération"
              title={
                playing
                  ? "Mettez en pause pour avancer pas à pas"
                  : "Avancer d'une génération"
              }
            >
              Suivant
            </Button>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2">
          <div className="flex w-full flex-wrap items-end justify-center gap-x-4 gap-y-2">
            <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="text-center text-sm font-medium">
                Taille de la grille (colonnes × lignes)
              </legend>
              <div className="flex flex-wrap items-end justify-center gap-2">
                <input
                  min={1}
                  type="number"
                  value={gridSizeInputs.x}
                  onChange={(e) => onGridSizeInputChange("x", e.target.value)}
                  placeholder="Largeur (colonnes)"
                  aria-label="Largeur de la grille en colonnes"
                  className="w-20 shrink-0"
                />
                <input
                  min={1}
                  type="number"
                  value={gridSizeInputs.y}
                  onChange={(e) => onGridSizeInputChange("y", e.target.value)}
                  placeholder="Hauteur (lignes)"
                  aria-label="Hauteur de la grille en lignes"
                  className="w-20 shrink-0"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onApplyGridSize}
                >
                  Ok
                </Button>
              </div>
            </fieldset>
            <fieldset className="flex min-w-0 flex-col gap-2 border-0 p-0">
              <legend className="text-center text-sm font-medium">
                Taille des cellules (px)
              </legend>
              <div className="flex flex-wrap items-end justify-center gap-2">
                <input
                  min={1}
                  type="number"
                  value={cellSizeInput}
                  onChange={(e) => onCellSizeInputChange(e.target.value)}
                  aria-label="Taille d'une cellule en pixels"
                  className="w-20 shrink-0"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={onApplyCellSize}
                >
                  Ok
                </Button>
              </div>
            </fieldset>
          </div>
        </div>

        <fieldset className="w-full border-0 p-0">
          <legend className="sr-only">Sauvegarde locale</legend>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    type="button"
                    variant="outline"
                    disabled={playing}
                    className="gap-1"
                    title={
                      playing
                        ? "Mettez en pause pour charger un motif"
                        : "Charger un motif classique"
                    }
                  >
                    Motifs connus
                    <ChevronDownIcon className="size-4 opacity-70" />
                  </Button>
                }
              />
              <DropdownMenuContent
                align="center"
                className="min-w-[min(20rem,calc(100vw-2rem))] max-w-[min(24rem,calc(100vw-2rem))]"
              >
                {patternMenuSections.map((section, sectionIdx) => (
                  <Fragment key={section.category}>
                    {sectionIdx > 0 ? <DropdownMenuSeparator /> : null}
                    <DropdownMenuGroup>
                      <DropdownMenuLabel className="text-xs">
                        {KNOWN_PATTERN_CATEGORY_LABEL[section.category]}
                      </DropdownMenuLabel>
                      {section.items.map((p) => (
                        <DropdownMenuItem
                          key={p.id}
                          className="flex-col items-start gap-0 py-2"
                          onClick={() => onLoadKnownPattern(p.snapshot)}
                        >
                          <span className="font-medium">{p.name}</span>
                          {p.author ? (
                            <span className="text-xs text-muted-foreground">
                              {p.author}
                            </span>
                          ) : null}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuGroup>
                  </Fragment>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <Button type="button" variant="outline" onClick={onSaveLocal}>
              Sauvegarde rapide
            </Button>
            <Button type="button" variant="outline" onClick={onLoadLocal}>
              Charger
            </Button>
            {showSaveToDb ? (
              <>
                <Button type="button" variant="default" onClick={onOpenSaveDb}>
                  Enregistrer nouveau
                </Button>
                {updateGridId !== null ? (
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={updateGridPending}
                    onClick={onUpdateGrid}
                  >
                    {updateGridPending
                      ? "Mise à jour…"
                      : "Mettre à jour la grille"}
                  </Button>
                ) : null}
              </>
            ) : null}
          </div>
        </fieldset>
      </div>

      <div className="flex w-full min-w-0 shrink-0 flex-col items-stretch md:w-80">
        {gridAiEnabled ? (
          <fieldset className="flex w-full flex-col gap-2 border-0 p-0">
            <legend className="w-full text-center text-sm font-medium">
              Commande IA
            </legend>
            <textarea
              value={gridAiPrompt}
              onChange={(e) => onGridAiPromptChange(e.target.value)}
              placeholder="Ex. ajouter un planeur, agrandir la grille, retirer des cellules…"
              aria-label="Instructions pour manipuler la grille"
              className="min-h-[7.5rem] w-full min-w-0 resize-y"
              maxLength={GRID_AI_PROMPT_MAX_LENGTH}
              disabled={gridAiSubmitting}
              rows={5}
              onKeyDown={(e) => {
                if (
                  (e.ctrlKey || e.metaKey) &&
                  e.key === "Enter" &&
                  !gridAiSubmitting
                ) {
                  e.preventDefault();
                  onGridAiSubmit();
                }
              }}
            />
            <Button
              type="button"
              variant="secondary"
              disabled={gridAiSubmitting}
              onClick={onGridAiSubmit}
              className="w-full"
            >
              {gridAiSubmitting ? "…" : "Appliquer"}
            </Button>
          </fieldset>
        ) : (
          <p className="text-center text-xs text-muted-foreground">
            {gridAiSessionPending
              ? "Vérification de la session…"
              : "Connectez-vous pour utiliser la commande IA (réservée aux comptes connectés)."}
          </p>
        )}
      </div>
    </div>
  );
}
