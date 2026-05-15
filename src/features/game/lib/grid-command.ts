/*
 * Exports publics :
 * - parseAndValidateGridAiStateJson — parse `{ "gridSize", "aliveCells" }` (structure uniquement).
 * - validateGridAiState — même validation à partir d’un objet déjà parsé.
 */
import { z } from "zod";

import type { GridCoord } from "@/features/game/lib/grid-handle-snapshot";

export const MAX_GRID_CELLS = 20_000;
export const GRID_AI_COMMENT_MAX_LENGTH = 1_000;

const gridCoordSchema = z.object({
  x: z.number().int(),
  y: z.number().int(),
});

const gridSizeSchema = z.object({
  x: z.number().int().min(1),
  y: z.number().int().min(1),
});

const gridAiStateSchema = z.object({
  gridSize: gridSizeSchema,
  aliveCells: z.array(gridCoordSchema),
  comment: z.string().max(GRID_AI_COMMENT_MAX_LENGTH).optional(),
});

export type GridAiState = z.infer<typeof gridAiStateSchema>;

type ParseGridAiStateResult =
  | { ok: true; gridSize: GridCoord; aliveCells: GridCoord[]; comment?: string }
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

export function validateGridAiState(data: unknown): ParseGridAiStateResult {
  const result = gridAiStateSchema.safeParse(data);
  if (!result.success) {
    const first = result.error.issues[0];
    const msg =
      first && typeof first.message === "string"
        ? first.message
        : "État de grille invalide.";
    return { ok: false, error: msg };
  }

  const { gridSize, aliveCells, comment } = result.data;
  const trimmedComment = comment?.trim();
  return {
    ok: true,
    gridSize: { ...gridSize },
    aliveCells: dedupeCoords(aliveCells),
    ...(trimmedComment ? { comment: trimmedComment } : {}),
  };
}

export function parseAndValidateGridAiStateJson(
  raw: string,
): ParseGridAiStateResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw) as unknown;
  } catch {
    return { ok: false, error: "JSON invalide." };
  }
  return validateGridAiState(parsed);
}
