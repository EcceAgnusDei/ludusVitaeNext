import type { GridCoord } from "@/features/game/lib/grid-types";

const FAKE_LLM_DELAY_MS = 200;

function gliderCells1Based(originX: number, originY: number): GridCoord[] {
  const sx = originX;
  const sy = originY;
  return [
    { x: sx, y: sy + 1 },
    { x: sx + 1, y: sy + 2 },
    { x: sx + 2, y: sy },
    { x: sx + 2, y: sy + 1 },
    { x: sx + 2, y: sy + 2 },
  ];
}

function centeredGlider(grid: GridCoord): GridCoord[] {
  if (grid.x >= 3 && grid.y >= 3) {
    const sx = Math.max(1, Math.floor((grid.x - 3) / 2) + 1);
    const sy = Math.max(1, Math.floor((grid.y - 3) / 2) + 1);
    const sxClamped = Math.min(sx, grid.x - 2);
    const syClamped = Math.min(sy, grid.y - 2);
    return gliderCells1Based(sxClamped, syClamped);
  }
  const cx = Math.max(1, Math.floor((grid.x + 1) / 2));
  const cy = Math.max(1, Math.floor((grid.y + 1) / 2));
  return [{ x: cx, y: cy }];
}

function horizontalBlinker(grid: GridCoord): GridCoord[] {
  const cy = Math.max(1, Math.floor((grid.y + 1) / 2));
  if (grid.x >= 3) {
    const left = Math.floor((grid.x - 3) / 2) + 1;
    return [
      { x: left, y: cy },
      { x: left + 1, y: cy },
      { x: left + 2, y: cy },
    ];
  }
  return [{ x: 1, y: cy }];
}

/*
 * Logique « LLM » factice : appelée par `POST /api/game/grid-command`.
 * Remplace plus tard par un vrai modèle côté route, en gardant la même sortie JSON.
 */
export async function fakeGridLlmJson(
  userText: string,
  gridSize: GridCoord,
): Promise<string> {
  await new Promise((r) => setTimeout(r, FAKE_LLM_DELAY_MS));

  const t = userText.trim().toLowerCase();

  if (t === "") {
    return JSON.stringify({
      action: "setAlive",
      cells: centeredGlider(gridSize),
    });
  }

  if (
    t.includes("vide") ||
    t.includes("efface") ||
    t.includes("vider") ||
    t.includes("clear")
  ) {
    return JSON.stringify({ action: "clear" });
  }

  if (t.includes("planeur") || t.includes("glider")) {
    return JSON.stringify({
      action: "setAlive",
      cells: centeredGlider(gridSize),
    });
  }

  return JSON.stringify({
    action: "setAlive",
    cells: horizontalBlinker(gridSize),
  });
}
