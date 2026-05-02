/*
 * Couverture des tests sur `grid-command.ts` :
 *
 * - parseGridCommandJson : succès pour clear, setAlive, killCells, resize ; échec JSON
 *   invalide et action inconnue (Zod).
 * - validateGridCommandForGrid : clear toujours ok ; setAlive / killCells hors grille ;
 *   setAlive valide en bord de grille ; resize dimensions < 1 et dépassement plafond
 *   largeur × hauteur.
 * - applyGridCommand : effets sur un mock (clear, setAlive remplace tout, killCells
 *   retire des coordonnées, resize met à jour la taille — sans migration des vivantes).
 * - parseAndValidateGridCommandJson : enchaînement parse + bornes ; échec si cellule
 *   hors grille alors que le JSON est valide.
 */
import { describe, expect, it } from "vitest";

import {
  applyGridCommand,
  parseAndValidateGridCommandJson,
  parseGridCommandJson,
  validateGridCommandForGrid,
  type GridCommandApplier,
} from "./grid-command";
import type { GridCoord } from "./grid-types";

function mockTarget(initial: {
  gridSize: GridCoord;
  alive: GridCoord[];
}): GridCommandApplier & { alive: GridCoord[]; gridSize: GridCoord } {
  let gridSize = { ...initial.gridSize };
  let alive = [...initial.alive];
  return {
    get gridSize() {
      return { ...gridSize };
    },
    get alive() {
      return alive;
    },
    getAliveCellsCoords() {
      return alive.map((c) => ({ x: c.x, y: c.y }));
    },
    applyAliveCells(coords: GridCoord[]) {
      alive = coords.map((c) => ({ x: c.x, y: c.y }));
    },
    resize(value: GridCoord | string) {
      if (typeof value === "string") return;
      gridSize = { x: value.x, y: value.y };
    },
  };
}

describe("parseGridCommandJson", () => {
  it("accepte clear", () => {
    const r = parseGridCommandJson('{"action":"clear"}');
    expect(r).toEqual({ ok: true, command: { action: "clear" } });
  });

  it("accepte setAlive avec coordonnées 1-based", () => {
    const r = parseGridCommandJson(
      '{"action":"setAlive","cells":[{"x":1,"y":2},{"x":3,"y":3}]}',
    );
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.command).toEqual({
        action: "setAlive",
        cells: [
          { x: 1, y: 2 },
          { x: 3, y: 3 },
        ],
      });
    }
  });

  it("accepte killCells", () => {
    const r = parseGridCommandJson(
      '{"action":"killCells","cells":[{"x":1,"y":1}]}',
    );
    expect(r).toEqual({
      ok: true,
      command: { action: "killCells", cells: [{ x: 1, y: 1 }] },
    });
  });

  it("accepte resize", () => {
    const r = parseGridCommandJson(
      '{"action":"resize","width":40,"height":30}',
    );
    expect(r).toEqual({
      ok: true,
      command: { action: "resize", width: 40, height: 30 },
    });
  });

  it("rejette JSON cassé", () => {
    const r = parseGridCommandJson("{");
    expect(r).toEqual({ ok: false, error: "JSON invalide." });
  });

  it("rejette action inconnue", () => {
    const r = parseGridCommandJson('{"action":"noop"}');
    expect(r.ok).toBe(false);
  });
});

describe("validateGridCommandForGrid", () => {
  const g10: GridCoord = { x: 10, y: 10 };

  it("clear toujours ok", () => {
    expect(validateGridCommandForGrid({ action: "clear" }, g10).ok).toBe(true);
  });

  it("setAlive refuse hors grille (coords 1-based)", () => {
    const r = validateGridCommandForGrid(
      {
        action: "setAlive",
        cells: [{ x: 0, y: 1 }],
      },
      g10,
    );
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.error).toContain("hors grille");
    }
  });

  it("setAlive accepte (10,10)", () => {
    const r = validateGridCommandForGrid(
      {
        action: "setAlive",
        cells: [{ x: 10, y: 10 }],
      },
      g10,
    );
    expect(r).toEqual({ ok: true });
  });

  it("killCells refuse hors grille", () => {
    const r = validateGridCommandForGrid(
      { action: "killCells", cells: [{ x: 11, y: 1 }] },
      g10,
    );
    expect(r.ok).toBe(false);
  });

  it("resize refuse dimensions invalides", () => {
    expect(
      validateGridCommandForGrid(
        { action: "resize", width: 0, height: 10 },
        g10,
      ).ok,
    ).toBe(false);
  });

  it("resize refuse dépassement plafond cellules", () => {
    const r = validateGridCommandForGrid(
      { action: "resize", width: 500, height: 500 },
      g10,
    );
    expect(r.ok).toBe(false);
  });
});

describe("applyGridCommand", () => {
  it("clear vide les vivantes", () => {
    const t = mockTarget({
      gridSize: { x: 5, y: 5 },
      alive: [{ x: 1, y: 1 }],
    });
    applyGridCommand(t, { action: "clear" });
    expect(t.alive).toEqual([]);
  });

  it("setAlive remplace l’ensemble", () => {
    const t = mockTarget({
      gridSize: { x: 5, y: 5 },
      alive: [{ x: 1, y: 1 }],
    });
    applyGridCommand(t, {
      action: "setAlive",
      cells: [{ x: 2, y: 2 }],
    });
    expect(t.alive).toEqual([{ x: 2, y: 2 }]);
  });

  it("killCells retire les coordonnées ciblées", () => {
    const t = mockTarget({
      gridSize: { x: 5, y: 5 },
      alive: [
        { x: 1, y: 1 },
        { x: 2, y: 2 },
        { x: 3, y: 3 },
      ],
    });
    applyGridCommand(t, {
      action: "killCells",
      cells: [{ x: 2, y: 2 }],
    });
    expect(t.alive).toEqual([
      { x: 1, y: 1 },
      { x: 3, y: 3 },
    ]);
  });

  it("resize met à jour la taille", () => {
    const t = mockTarget({
      gridSize: { x: 5, y: 5 },
      alive: [],
    });
    applyGridCommand(t, { action: "resize", width: 12, height: 8 });
    expect(t.gridSize).toEqual({ x: 12, y: 8 });
  });
});

describe("parseAndValidateGridCommandJson", () => {
  it("enchaîne parse + validation", () => {
    const r = parseAndValidateGridCommandJson(
      '{"action":"setAlive","cells":[{"x":2,"y":2}]}',
      { x: 3, y: 3 },
    );
    expect(r.ok).toBe(true);
  });

  it("échoue si cellule hors grille", () => {
    const r = parseAndValidateGridCommandJson(
      '{"action":"setAlive","cells":[{"x":5,"y":5}]}',
      { x: 3, y: 3 },
    );
    expect(r.ok).toBe(false);
  });
});
