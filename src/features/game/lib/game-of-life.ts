/* Déplacements relatifs des 8 voisins d’une case (Moore). */
const NEIGHBOR_OFFSETS: [number, number][] = [
  [-1, -1],
  [0, -1],
  [1, -1],
  [-1, 0],
  [1, 0],
  [-1, 1],
  [0, 1],
  [1, 1],
];

export type GenerationDelta = {
  born: Set<number>;
  died: Set<number>;
};

export function toCellIndex(x: number, y: number, maxX: number): number {
  return (y - 1) * maxX + (x - 1);
}

export function cellIndexToCoord(
  idx: number,
  maxX: number,
): { x: number; y: number } {
  return {
    x: (idx % maxX) + 1,
    y: Math.floor(idx / maxX) + 1,
  };
}

export function computeNextGeneration(
  currentlyAlive: Set<number>,
  maxX: number,
  maxY: number,
): GenerationDelta {
  const neighborCounts = new Map<number, number>();
  for (const idx of currentlyAlive) {
    const { x, y } = cellIndexToCoord(idx, maxX);
    for (const [dx, dy] of NEIGHBOR_OFFSETS) {
      const i = x + dx;
      const j = y + dy;
      if (i < 1 || i > maxX || j < 1 || j > maxY) continue;
      const neighborIdx = toCellIndex(i, j, maxX);
      neighborCounts.set(neighborIdx, (neighborCounts.get(neighborIdx) ?? 0) + 1);
    }
  }

  const died = new Set<number>();
  for (const idx of currentlyAlive) {
    const liveNeighbors = neighborCounts.get(idx) ?? 0;
    if (liveNeighbors < 2 || liveNeighbors > 3) died.add(idx);
  }

  const born = new Set<number>();
  for (const [idx, liveNeighbors] of neighborCounts) {
    if (liveNeighbors === 3 && !currentlyAlive.has(idx)) born.add(idx);
  }

  return { born, died };
}
