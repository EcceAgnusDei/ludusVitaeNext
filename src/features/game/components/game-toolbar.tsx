"use client";

import { Button } from "@/components/ui/button";

/** Plafond largeur × hauteur : au-delà, trop de nœuds DOM pour rester fluide dans le navigateur. */
export const MAX_GRID_CELLS = 20_000;

type GameToolbarProps = {
  playing: boolean;
  onPlayToggle: () => void;
  onStep: () => void;
  onSpeedChange: (value: number) => void;
  gridSizeInputs: { x: string; y: string };
  onGridSizeInputChange: (field: "x" | "y", value: string) => void;
  onApplyGridSize: () => void;
  cellSizeInput: string;
  onCellSizeInputChange: (value: string) => void;
  onApplyCellSize: () => void;
  onSaveLocal: () => void;
  onLoadLocal: () => void;
  showSaveToDb: boolean;
  onOpenSaveDb: () => void;
};

export function GameToolbar({
  playing,
  onPlayToggle,
  onStep,
  onSpeedChange,
  gridSizeInputs,
  onGridSizeInputChange,
  onApplyGridSize,
  cellSizeInput,
  onCellSizeInputChange,
  onApplyCellSize,
  onSaveLocal,
  onLoadLocal,
  showSaveToDb,
  onOpenSaveDb,
}: GameToolbarProps) {
  return (
    <div className="mx-auto flex max-w-[min(18rem,100%)] flex-col items-center gap-4">
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

      <fieldset className="w-full gap-2 border-0 p-0">
        <legend className="sr-only">Sauvegarde locale</legend>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-center">
          <Button type="button" variant="outline" onClick={onSaveLocal}>
            Sauvegarder localement
          </Button>
          <Button type="button" variant="outline" onClick={onLoadLocal}>
            Charger
          </Button>
          {showSaveToDb ? (
            <Button type="button" variant="default" onClick={onOpenSaveDb}>
              Enregistrer en base
            </Button>
          ) : null}
        </div>
      </fieldset>
    </div>
  );
}
