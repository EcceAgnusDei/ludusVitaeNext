import type { GridCoord, GridPlaySnapshot } from "./grid-handle-snapshot";

const MIN_GRID_W = 50;
const MIN_GRID_H = 30;

function parseConwayLifeRle(source: string): GridCoord[] {
  const cleaned = source
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#"));
  const dimIdx = cleaned.findIndex((l) => /^x\s*=/i.test(l));
  if (dimIdx < 0) throw new Error("missing x=");
  let body = cleaned
    .slice(dimIdx + 1)
    .join("")
    .replace(/\s+/g, "");
  const bang = body.indexOf("!");
  if (bang >= 0) body = body.slice(0, bang);
  let x = 0;
  let y = 0;
  let run = 0;
  const coords: GridCoord[] = [];
  for (let i = 0; i < body.length; i++) {
    const ch = body[i];
    if (ch >= "0" && ch <= "9") {
      run = run * 10 + (ch.charCodeAt(0) - 48);
      continue;
    }
    const n = run === 0 ? 1 : run;
    run = 0;
    if (ch === "b" || ch === ".") {
      x += n;
    } else if (ch === "o") {
      for (let k = 0; k < n; k++) {
        coords.push({ x: x + k + 1, y: y + 1 });
      }
      x += n;
    } else if (ch === "$") {
      y += n;
      x = 0;
    }
  }
  return coords;
}

function parseLifeCellsPlain(source: string): GridCoord[] {
  const lines = source
    .split(/\r?\n/)
    .map((l) => l.replace(/\s+$/g, ""))
    .filter((l) => l.length > 0 && !l.trim().startsWith("!"));
  const maxW = Math.max(...lines.map((l) => l.length));
  const coords: GridCoord[] = [];
  for (let row = 0; row < lines.length; row++) {
    const line = lines[row].padEnd(maxW, ".");
    for (let col = 0; col < maxW; col++) {
      const ch = line[col];
      if (ch === "O" || ch === "*") {
        coords.push({ x: col + 1, y: row + 1 });
      }
    }
  }
  return coords;
}

function gridSnapshotFromAliveCells(coords: GridCoord[]): GridPlaySnapshot {
  if (coords.length === 0) {
    throw new Error("empty pattern");
  }
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
  const patternW = maxX - minX + 1;
  const patternH = maxY - minY + 1;
  const gridW = Math.max(MIN_GRID_W, patternW + 2);
  const gridH = Math.max(MIN_GRID_H, patternH + 2);
  const startX = Math.floor((gridW - patternW) / 2) + 1;
  const startY = Math.floor((gridH - patternH) / 2) + 1;
  const aliveCells = coords.map((c) => ({
    x: c.x - minX + startX,
    y: c.y - minY + startY,
  }));
  return {
    gridSize: { x: gridW, y: gridH },
    aliveCells,
  };
}

export type KnownPatternCategory =
  | "still"
  | "oscillator"
  | "ship"
  | "methuselah"
  | "gun";

export type KnownGameOfLifePattern = {
  id: string;
  name: string;
  author: string | null;
  category: KnownPatternCategory;
  snapshot: GridPlaySnapshot;
};

function pattern(
  id: string,
  name: string,
  author: string | null,
  category: KnownPatternCategory,
  coords: GridCoord[],
): KnownGameOfLifePattern {
  return {
    id,
    name,
    author,
    category,
    snapshot: gridSnapshotFromAliveCells(coords),
  };
}

const GOSPER_GLIDER_GUN_CELLS = `
........................O 
......................O.O 
............OO......OO............OO 
...........O...O....OO............OO 
OO........O.....O...OO 
OO........O...O.OO....O.O 
..........O.....O.......O 
...........O...O 
............OO 
`;

const PULSAR_RLE = `x = 13, y = 13, rule = B3/S23
2b3o3b3o2b2$o4bobo4bo$o4bobo4bo$o4bobo4bo$2b3o3b3o2b2$2b3o3b3o2b$o4bobo4bo$o4bobo4bo$o4bobo4bo2$2b3o3b3o!`;

export const KNOWN_PATTERN_CATEGORY_LABEL: Record<
  KnownPatternCategory,
  string
> = {
  still: "Natures mortes",
  oscillator: "Oscillateurs",
  ship: "Vaisseaux",
  methuselah: "Méthuselahs",
  gun: "Canon",
};

const CATEGORY_ORDER: KnownPatternCategory[] = [
  "still",
  "oscillator",
  "ship",
  "methuselah",
  "gun",
];

export const KNOWN_GAME_OF_LIFE_PATTERNS: KnownGameOfLifePattern[] = (() => {
  const list: KnownGameOfLifePattern[] = [
    pattern(
      "block",
      "Bloc",
      null,
      "still",
      parseConwayLifeRle(`x = 2, y = 2, rule = B3/S23
2o$2o!`),
    ),
    pattern(
      "beehive",
      "Ruche",
      "John Conway",
      "still",
      parseConwayLifeRle(`x = 4, y = 3, rule = B3/S23
b2ob$o2bo$b2o!`),
    ),
    pattern(
      "loaf",
      "Pain de mie",
      null,
      "still",
      parseConwayLifeRle(`x = 4, y = 4, rule = B3/S23
b2ob$o2bo$bobo$2bo!`),
    ),
    pattern(
      "blinker",
      "Clignotant",
      null,
      "oscillator",
      parseConwayLifeRle(`x = 3, y = 1, rule = B3/S23
3o!`),
    ),
    pattern(
      "toad",
      "Crapaud",
      null,
      "oscillator",
      parseConwayLifeRle(`x = 4, y = 2, rule = B3/S23
b3o$3o!`),
    ),
    pattern(
      "beacon",
      "Balise",
      null,
      "oscillator",
      parseConwayLifeRle(`x = 4, y = 4, rule = B3/S23
2o$2o$2b2o$2b2o!`),
    ),
    pattern(
      "pulsar",
      "Pulsar",
      "John Conway",
      "oscillator",
      parseConwayLifeRle(PULSAR_RLE),
    ),
    pattern(
      "pentadecathlon",
      "Pentadécathlon",
      "John Conway",
      "oscillator",
      parseConwayLifeRle(`x = 10, y = 3, rule = B3/S23
2bo4bo2b$2ob4ob2o$2bo4bo!`),
    ),
    pattern(
      "glider",
      "Planeur",
      null,
      "ship",
      parseConwayLifeRle(`x = 3, y = 3, rule = B3/S23
bob$2bo$3o!`),
    ),
    pattern(
      "lwss",
      "Petit vaisseau (LWSS)",
      "John Conway",
      "ship",
      parseConwayLifeRle(`x = 5, y = 4, rule = B3/S23
bo2bo$o4b$o3bo$4o!`),
    ),
    pattern(
      "mwss",
      "Vaisseau moyen (MWSS)",
      "John Conway",
      "ship",
      parseConwayLifeRle(`x = 6, y = 5, rule = B3/S23
3bo2b$bo3bo$o5b$o4bo$5o!`),
    ),
    pattern(
      "hwss",
      "Grand vaisseau (HWSS)",
      "John Conway",
      "ship",
      parseConwayLifeRle(`x = 7, y = 5, rule = B3/S23
3b2o2b$bo4bo$o6b$o5bo$6o!`),
    ),
    pattern(
      "r-pentomino",
      "R-pentomino",
      null,
      "methuselah",
      parseConwayLifeRle(`x = 3, y = 3, rule = B3/S23
b2o$2ob$bo!`),
    ),
    pattern(
      "acorn",
      "Gland (acorn)",
      "Charles Corderman",
      "methuselah",
      parseConwayLifeRle(`x = 7, y = 3, rule = B3/S23
bo5b$3bo3b$2o2b3o!`),
    ),
    pattern(
      "die-hard",
      "Die hard",
      null,
      "methuselah",
      parseConwayLifeRle(`x = 8, y = 3, rule = B3/S23
6bob$2o6b$bo3b3o!`),
    ),
    pattern(
      "gosper-glider-gun",
      "Canon de Gosper",
      "Bill Gosper",
      "gun",
      parseLifeCellsPlain(GOSPER_GLIDER_GUN_CELLS),
    ),
  ];
  list.sort((a, b) => {
    const ca = CATEGORY_ORDER.indexOf(a.category);
    const cb = CATEGORY_ORDER.indexOf(b.category);
    if (ca !== cb) return ca - cb;
    return a.name.localeCompare(b.name, "fr");
  });
  return list;
})();
