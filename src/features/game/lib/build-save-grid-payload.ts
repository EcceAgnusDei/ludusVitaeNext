import type { GridCoord } from "./grid-types";

export type SaveGridApiBody = {
  data: {
    aliveCells: GridCoord[];
    gridSize: GridCoord;
    cellSize: string;
  };
  name?: string;
  isPublic: boolean;
};

export function buildSaveGridApiBody(input: {
  aliveCells: GridCoord[];
  gridSize: GridCoord;
  cellSize: string;
  nameTrimmed: string;
  isPublic: boolean;
}): SaveGridApiBody {
  const body: SaveGridApiBody = {
    data: {
      aliveCells: input.aliveCells,
      gridSize: { ...input.gridSize },
      cellSize: input.cellSize,
    },
    isPublic: input.isPublic,
  };
  if (input.nameTrimmed.length > 0) body.name = input.nameTrimmed;
  return body;
}
