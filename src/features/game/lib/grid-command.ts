/*
 * Exports publics :
 * - parseAndValidateGridCommandBatchJson — parse `{ "commands": [...] }`, normalise l’ordre (resize puis setAlive si les deux), valide resize et setAlive.
 */
import { z } from "zod";

import type { GridCoord } from "@/features/game/lib/grid-types";

export const MAX_GRID_CELLS = 20_000;

const gridCoordSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

const setAliveCommandSchema = z.object({
  action: z.literal("setAlive"),
  cells: z.array(gridCoordSchema),
});

const resizeCommandSchema = z.object({
  action: z.literal("resize"),
  width: z.number().int(),
  height: z.number().int(),
});

const gridCommandSchema = z.discriminatedUnion("action", [
  resizeCommandSchema,
  setAliveCommandSchema,
]);

export type GridCommand = z.infer<typeof gridCommandSchema>;

const gridCommandBatchSchema = z.object({
  commands: z.array(gridCommandSchema).min(1),
});

type ParseGridCommandBatchResult =
  | { ok: true; commands: GridCommand[] }
  | { ok: false; error: string };

export function coordKey(c: GridCoord): string {
  return `${c.x},${c.y}`;
}

export function dedupeCoords(cells: GridCoord[]): GridCoord[] {
  const seen = new Set<string>();
  const out: GridCoord[] = [];
  for (const c of cells) {
    const k = coordKey(c);
    if (!seen.has(k)) {
      seen.add(k);
      out.push(c);
    }
  }
  return out;
}

function normalizeGridAiCommandOrder(
  commands: GridCommand[],
): ParseGridCommandBatchResult {
  const resizes = commands.filter((c) => c.action === "resize");
  const setAlives = commands.filter((c) => c.action === "setAlive");
  if (resizes.length > 1) {
    return { ok: false, error: "Une seule commande « resize » est autorisée." };
  }
  if (setAlives.length > 1) {
    return {
      ok: false,
      error: "Une seule commande « setAlive » est autorisée.",
    };
  }
  const resize = resizes[0];
  const setAlive = setAlives[0];
  const ordered: GridCommand[] = [];
  if (resize) ordered.push(resize);
  if (setAlive) ordered.push(setAlive);
  return { ok: true, commands: ordered };
}

function validateResize(
  command: Extract<GridCommand, { action: "resize" }>,
): { ok: true } | { ok: false; error: string } {
  const { width, height } = command;
  if (width < 1 || height < 1) {
    return {
      ok: false,
      error: "resize : largeur et hauteur doivent être ≥ 1.",
    };
  }
  const total = width * height;
  if (total > MAX_GRID_CELLS) {
    return {
      ok: false,
      error: `resize : au plus ${MAX_GRID_CELLS.toLocaleString("fr-FR")} cellules (largeur × hauteur).`,
    };
  }
  return { ok: true };
}

function validateSetAliveForGridSize(
  gridSize: GridCoord,
  command: Extract<GridCommand, { action: "setAlive" }>,
): { ok: true } | { ok: false; error: string } {
  const maxX = gridSize.x;
  const maxY = gridSize.y;
  if (maxX < 1 || maxY < 1) {
    return { ok: false, error: "Grille cible invalide." };
  }
  const capacity = Math.min(maxX * maxY, MAX_GRID_CELLS);
  const cells = dedupeCoords(command.cells);
  if (cells.length > capacity) {
    return {
      ok: false,
      error: `setAlive : trop de cellules (max ${capacity}).`,
    };
  }
  for (let i = 0; i < cells.length; i++) {
    const { x, y } = cells[i]!;
    if (x < 1 || x > maxX || y < 1 || y > maxY) {
      return {
        ok: false,
        error: `setAlive : cellule hors grille (${x}, ${y}) ; bornes 1..${maxX} × 1..${maxY}.`,
      };
    }
  }
  return { ok: true };
}

export function parseAndValidateGridCommandBatchJson(
  raw: string,
  initialGridSize: GridCoord,
): ParseGridCommandBatchResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: "JSON invalide." };
  }

  const result = gridCommandBatchSchema.safeParse(parsed);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg =
      first && typeof first.message === "string"
        ? first.message
        : "Lot de commandes invalide.";
    return { ok: false, error: msg };
  }

  const ordered = normalizeGridAiCommandOrder(result.data.commands);
  if (!ordered.ok) return ordered;

  const cmds = ordered.commands;
  if (cmds.length === 1) {
    const c = cmds[0]!;
    if (c.action === "resize") {
      const r = validateResize(c);
      if (!r.ok) return { ok: false, error: r.error };
    } else {
      const r = validateSetAliveForGridSize(initialGridSize, c);
      if (!r.ok) return { ok: false, error: r.error };
    }
    return { ok: true, commands: cmds };
  }

  const resize = cmds[0]!;
  const setAlive = cmds[1]!;
  if (resize.action !== "resize" || setAlive.action !== "setAlive") {
    return {
      ok: false,
      error:
        "Avec deux commandes, l’ordre doit être : « resize » puis « setAlive ».",
    };
  }
  const vr = validateResize(resize);
  if (!vr.ok) return { ok: false, error: vr.error };

  const targetSize: GridCoord = { x: resize.width, y: resize.height };
  const vs = validateSetAliveForGridSize(targetSize, setAlive);
  if (!vs.ok) return { ok: false, error: vs.error };

  return { ok: true, commands: cmds };
}
