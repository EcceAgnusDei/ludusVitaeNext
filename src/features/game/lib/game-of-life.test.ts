import { describe, expect, it } from "vitest";

import { computeNextGeneration, toCellIndex } from "./game-of-life";

type Coord = { x: number; y: number };

function indexSet(coords: Coord[], width: number): Set<number> {
  return new Set(coords.map((c) => toCellIndex(c.x, c.y, width)));
}

describe("computeNextGeneration", () => {
  it("oscille correctement avec un blinker", () => {
    const width = 5;
    const height = 5;
    const alive = indexSet(
      [
        { x: 2, y: 3 },
        { x: 3, y: 3 },
        { x: 4, y: 3 },
      ],
      width,
    );

    const { born, died } = computeNextGeneration(alive, width, height);

    expect(born).toEqual(
      indexSet(
        [
          { x: 3, y: 2 },
          { x: 3, y: 4 },
        ],
        width,
      ),
    );
    expect(died).toEqual(
      indexSet(
        [
          { x: 2, y: 3 },
          { x: 4, y: 3 },
        ],
        width,
      ),
    );
  });

  it("tue une cellule en surpopulation (> 3 voisins)", () => {
    const width = 5;
    const height = 5;
    const alive = indexSet(
      [
        { x: 3, y: 3 }, // cellule testée (4 voisins)
        { x: 2, y: 3 },
        { x: 4, y: 3 },
        { x: 3, y: 2 },
        { x: 3, y: 4 },
      ],
      width,
    );

    const { died } = computeNextGeneration(alive, width, height);

    expect(died.has(toCellIndex(3, 3, width))).toBe(true);
  });

  it("fait naitre une cellule morte avec exactement 3 voisins", () => {
    const width = 5;
    const height = 5;
    const alive = indexSet(
      [
        { x: 2, y: 3 },
        { x: 3, y: 2 },
        { x: 4, y: 3 },
      ],
      width,
    );

    const { born } = computeNextGeneration(alive, width, height);

    expect(born.has(toCellIndex(3, 3, width))).toBe(true);
  });

  it("respecte les bords de grille (pas de wrap-around)", () => {
    const width = 5;
    const height = 5;
    const alive = indexSet(
      [
        { x: 1, y: 1 },
        { x: 2, y: 1 },
        { x: 3, y: 1 },
      ],
      width,
    );

    const { born } = computeNextGeneration(alive, width, height);

    expect(born.size).toBe(1); // vérifie qu'il n'y a pas de naissance hors grille
  });
});
