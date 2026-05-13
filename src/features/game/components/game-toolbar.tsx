"use client";

import { Button } from "@/components/ui/button";

import { MAX_GRID_CELLS } from "@/features/game/lib/grid-command";
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
  showSaveToDb,
  onOpenSaveDb,
  updateGridId,
  onUpdateGrid,
  updateGridPending,
}: GameToolbarProps) {
  return (
    <div className="mx-auto flex max-w-[min(22rem,100%)] flex-col items-center gap-4">
      <div className="flex flex-wrap items-center justify-center gap-2">
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
            playing ? "Mettez en pause pour refaire" : "Rétablir l’état annulé"
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
          title={playing ? "Mettez en pause pour vider la grille" : "Remet à 0"}
        >
          Reset
        </Button>
      </div>

      <label className="flex w-full flex-col gap-1 text-sm">
        <span className="text-center">Vitesse</span>
        <input
          type="range"
          min={1}
          max={100}
          defaultValue={1}
          className="w-full"
          onInput={(e) => onSpeedChange(Number(e.currentTarget.value))}
        />
      </label>

      <fieldset className="flex w-full flex-col gap-2 border-0 p-0">
        <legend className="sr-only">Taille de la grille</legend>
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
          <Button type="button" variant="secondary" onClick={onApplyGridSize}>
            Ok
          </Button>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          Largeur × hauteur ≤ {MAX_GRID_CELLS.toLocaleString("fr-FR")} cellules
          au total.
        </p>
      </fieldset>

      <fieldset className="flex w-full flex-wrap items-end justify-center gap-2 border-0 p-0">
        <legend className="sr-only">Taille des cellules</legend>
        <input
          min={1}
          type="number"
          value={cellSizeInput}
          onChange={(e) => onCellSizeInputChange(e.target.value)}
          aria-label="Taille d'une cellule en pixels"
          className="w-20 shrink-0"
        />
        <Button type="button" variant="secondary" onClick={onApplyCellSize}>
          Ok
        </Button>
      </fieldset>

      {gridAiEnabled ? (
        <fieldset className="flex w-full flex-col gap-2 border-0 p-0">
          <legend className="text-center text-sm font-medium">
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

      <fieldset className="w-full gap-2 border-0 p-0">
        <legend className="sr-only">Sauvegarde locale</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
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
  );
}
