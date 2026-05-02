/* Fonctions de vérification et d'exécution permettant de commander la grille. */
import { z } from "zod";

import type { GridCoord } from "@/features/game/lib/grid-types";

const MAX_GRID_TOTAL_CELLS = 20_000; // Doit rester aligné avec `MAX_GRID_CELLS` dans `game-toolbar.tsx`.

const gridCoordSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

const clearCommandSchema = z.object({
  action: z.literal("clear"),
});

const setAliveCommandSchema = z.object({
  action: z.literal("setAlive"),
  cells: z.array(gridCoordSchema),
});

const killCellsCommandSchema = z.object({
  action: z.literal("killCells"),
  cells: z.array(gridCoordSchema),
});

const resizeCommandSchema = z.object({
  action: z.literal("resize"),
  width: z.number().int(),
  height: z.number().int(),
});

export const gridCommandSchema = z.discriminatedUnion("action", [
  clearCommandSchema,
  setAliveCommandSchema,
  killCellsCommandSchema,
  resizeCommandSchema,
]);

export type GridCommand = z.infer<typeof gridCommandSchema>;

export type GridCommandApplier = {
  readonly gridSize: GridCoord;
  getAliveCellsCoords: () => GridCoord[];
  applyAliveCells: (coords: GridCoord[]) => void;
  resize: (value: GridCoord | string) => void;
};

export type ParseGridCommandResult =
  | { ok: true; command: GridCommand }
  | { ok: false; error: string };

/*
 * Vérifie que la commande passée en JSON est valide.
 */
export function parseGridCommandJson(raw: string): ParseGridCommandResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: "JSON invalide." };
  }

  const result = gridCommandSchema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg =
      first && typeof first.message === "string"
        ? first.message
        : "Commande invalide.";
    return { ok: false, error: msg };
  }

  return { ok: true, command: result.data };
}

/*
 * Vérifie que la commande est réalisable sur la grille actuelle (bornes, plafonds).
 */
export function validateGridCommandForGrid(
  command: GridCommand,
  gridSize: GridCoord,
): { ok: true } | { ok: false; error: string } {
  switch (command.action) {
    case "clear":
      return { ok: true };

    case "resize": {
      const { width, height } = command;
      if (width < 1 || height < 1) {
        return {
          ok: false,
          error: "resize : largeur et hauteur doivent être ≥ 1.",
        };
      }
      const total = width * height;
      if (total > MAX_GRID_TOTAL_CELLS) {
        return {
          ok: false,
          error: `resize : au plus ${MAX_GRID_TOTAL_CELLS.toLocaleString("fr-FR")} cellules (largeur × hauteur).`,
        };
      }
      return { ok: true };
    }

    case "setAlive":
    case "killCells": {
      const maxX = gridSize.x;
      const maxY = gridSize.y;
      if (maxX < 1 || maxY < 1) {
        return { ok: false, error: "Grille actuelle invalide." };
      }
      const maxCells = Math.min(maxX * maxY, MAX_GRID_TOTAL_CELLS);
      if (command.cells.length > maxCells) {
        return {
          ok: false,
          error: `${command.action} : trop de cellules (max ${maxCells}).`,
        };
      }
      for (let i = 0; i < command.cells.length; i++) {
        const { x, y } = command.cells[i]!;
        if (x < 1 || x > maxX || y < 1 || y > maxY) {
          return {
            ok: false,
            error: `${command.action} : cellule hors grille (${x}, ${y}) ; bornes 1..${maxX} × 1..${maxY}.`,
          };
        }
      }
      return { ok: true };
    }

    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}

/*
 * Combine les deux vérifications précédentes.
 */
export function parseAndValidateGridCommandJson(
  raw: string,
  gridSize: GridCoord,
): ParseGridCommandResult {
  const parsed = parseGridCommandJson(raw);
  if (!parsed.ok) return parsed;

  const check = validateGridCommandForGrid(parsed.command, gridSize);
  if (!check.ok) {
    return { ok: false, error: check.error };
  }

  return parsed;
}

/*
 * Applique une commande déjà validée pour la grille courante.
 */
export function applyGridCommand(
  target: GridCommandApplier,
  command: GridCommand,
): void {
  switch (command.action) {
    case "clear":
      target.applyAliveCells([]);
      return;
    case "setAlive":
      target.applyAliveCells(command.cells);
      return;
    case "killCells": {
      const remove = new Set(command.cells.map((c) => `${c.x},${c.y}`));
      const next = target
        .getAliveCellsCoords()
        .filter((c) => !remove.has(`${c.x},${c.y}`));
      target.applyAliveCells(next);
      return;
    }
    case "resize":
      target.resize({ x: command.width, y: command.height });
      return;
    default: {
      const _exhaustive: never = command;
      return _exhaustive;
    }
  }
}
