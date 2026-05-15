import { MAX_GRID_CELLS } from "@/features/game/lib/grid-command";

export type GridCoord = { x: number; y: number };

export const GRID_PATTERN_MARGIN = 10;

export type GridPlaySnapshot = {
  gridSize: GridCoord;
  aliveCells: GridCoord[];
  cellSize?: string | null;
};

export type GridPlaySnapshotTarget = {
  pause: () => void;
  resize: (value: string | GridCoord) => void;
  applyAliveCells: (coords: GridCoord[]) => void;
  gridSize: GridCoord;
  cellSize: string;
  getAliveCellsCoords: () => GridCoord[];
};

function coordsExceedGrid(coords: GridCoord[], gridSize: GridCoord): boolean {
  for (const c of coords) {
    if (c.x < 1 || c.x > gridSize.x || c.y < 1 || c.y > gridSize.y) return true;
  }
  return false;
}

export function fitCoordsInGridWithMargin(
  coords: GridCoord[],
  currentSize: GridCoord,
): { ok: true; coords: GridCoord[]; exceeds: boolean } | { ok: false; error: string } {
  if (coords.length === 0) {
    return { ok: false, error: "Aucune cellule à décaler." };
  }
  return {
    ok: true,
    coords,
    exceeds: coordsExceedGrid(coords, currentSize),
  };
}

function expandCoordsWithGridMargin(
  coords: GridCoord[],
  currentSize: GridCoord,
): { ok: true; coords: GridCoord[]; gridSize: GridCoord } | { ok: false; error: string } {
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const c of coords) {
    minX = Math.min(minX, c.x);
    minY = Math.min(minY, c.y);
    maxX = Math.max(maxX, c.x);
    maxY = Math.max(maxY, c.y);
  }

  const margin = GRID_PATTERN_MARGIN;
  const translateX = Math.max(0, margin + 1 - minX);
  const translateY = Math.max(0, margin + 1 - minY);
  const fitted = coords.map((c) => ({
    x: c.x + translateX,
    y: c.y + translateY,
  }));

  let fitMaxX = -Infinity;
  let fitMaxY = -Infinity;
  for (const c of fitted) {
    fitMaxX = Math.max(fitMaxX, c.x);
    fitMaxY = Math.max(fitMaxY, c.y);
  }

  const gridSize = {
    x: Math.max(currentSize.x, fitMaxX + margin),
    y: Math.max(currentSize.y, fitMaxY + margin),
  };
  const total = gridSize.x * gridSize.y;
  if (total > MAX_GRID_CELLS) {
    return {
      ok: false,
      error: `Impossible d’agrandir la grille : au plus ${MAX_GRID_CELLS.toLocaleString("fr-FR")} cellules (largeur × hauteur).`,
    };
  }

  return { ok: true, coords: fitted, gridSize };
}

export function applyPlaySnapshotToGridTarget(
  grid: GridPlaySnapshotTarget,
  snapshot: GridPlaySnapshot,
): string | null {
  grid.pause();
  let coords = snapshot.aliveCells;
  let targetSize = snapshot.gridSize;
  const currentSize = grid.gridSize;

  if (
    coordsExceedGrid(coords, currentSize) &&
    targetSize.x === currentSize.x &&
    targetSize.y === currentSize.y
  ) {
    const expanded = expandCoordsWithGridMargin(coords, currentSize);
    if (!expanded.ok) return expanded.error;
    coords = expanded.coords;
    targetSize = expanded.gridSize;
  }

  if (targetSize.x !== currentSize.x || targetSize.y !== currentSize.y) {
    grid.resize(targetSize);
  }
  grid.applyAliveCells(coords);
  if (snapshot.cellSize) {
    grid.resize(snapshot.cellSize);
  }
  return null;
}

export function snapshotFromGridTarget(
  grid: GridPlaySnapshotTarget,
): GridPlaySnapshot {
  return {
    gridSize: grid.gridSize,
    aliveCells: grid.getAliveCellsCoords(),
    cellSize: grid.cellSize,
  };
}
