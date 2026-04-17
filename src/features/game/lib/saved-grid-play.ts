import type { GridCoord, GridPlaySnapshot } from "./grid-types";

/**
 * Vérifie que les données de grille (ex. JSON en base) sont valides et les convertit
 * en un objet utilisable par le composant Grid.
 */
export function parseSavedGridData(data: unknown): GridPlaySnapshot | null {
  if (!data || typeof data !== "object") return null;
  const d = data as Record<string, unknown>;
  const gridSizeRaw = d.gridSize;
  const aliveRaw = d.aliveCells;
  if (!gridSizeRaw || typeof gridSizeRaw !== "object") return null;
  const gx = (gridSizeRaw as { x?: unknown }).x;
  const gy = (gridSizeRaw as { y?: unknown }).y;
  if (!Number.isFinite(gx) || !Number.isFinite(gy)) return null;
  const x = Number(gx);
  const y = Number(gy);
  if (!Number.isInteger(x) || !Number.isInteger(y) || x < 1 || y < 1)
    return null;
  if (!Array.isArray(aliveRaw)) return null;

  const aliveCells: GridCoord[] = [];
  for (const c of aliveRaw) {
    if (!c || typeof c !== "object") continue;
    const cx = (c as { x?: unknown }).x;
    const cy = (c as { y?: unknown }).y;
    if (!Number.isFinite(cx) || !Number.isFinite(cy)) continue;
    aliveCells.push({ x: Number(cx), y: Number(cy) });
  }

  const cellSizeRaw = d.cellSize;
  const cellSize =
    typeof cellSizeRaw === "string" && cellSizeRaw.trim().length > 0
      ? cellSizeRaw.trim()
      : null;

  return { aliveCells, gridSize: { x, y }, cellSize };
}
