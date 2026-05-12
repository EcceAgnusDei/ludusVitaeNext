import type { GridCoord, GridPlaySnapshot } from "./grid-types";

export type GridPlaySnapshotTarget = {
  pause: () => void;
  resize: (value: string | GridCoord) => void;
  applyAliveCells: (coords: GridCoord[]) => void;
  gridSize: GridCoord;
  cellSize: string;
  getAliveCellsCoords: () => GridCoord[];
};

export function applyPlaySnapshotToGridTarget(
  grid: GridPlaySnapshotTarget,
  snapshot: GridPlaySnapshot,
): void {
  grid.pause();
  grid.resize(snapshot.gridSize);
  grid.applyAliveCells(snapshot.aliveCells);
  if (snapshot.cellSize) {
    grid.resize(snapshot.cellSize);
  }
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
