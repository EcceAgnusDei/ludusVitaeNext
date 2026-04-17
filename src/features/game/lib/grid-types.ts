export type GridCoord = { x: number; y: number };

export type GridPlaySnapshot = {
  gridSize: GridCoord;
  aliveCells: GridCoord[];
  cellSize?: string | null;
};
