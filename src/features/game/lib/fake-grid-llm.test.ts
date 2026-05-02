/*
 * Couverture : le module `fakeGridLlmJson` (LLM simulé) et la forme du JSON renvoyé.
 * - Mot-clé « vide » (et variantes du scénario) → commande `clear` parseable.
 * - Mot-clé « planeur » → `setAlive` avec 5 cellules (motif planeur).
 * - Entrée vide après trim → `setAlive` (planeur par défaut).
 * - Texte sans mot-clé reconnu → `setAlive` clignotant horizontal (3 cellules sur grille 10×10).
 * La validation métier (bornes, etc.) reste testée dans `grid-command.test.ts`.
 */
import { describe, expect, it } from "vitest";

import { parseGridCommandJson } from "@/features/game/lib/grid-command";

import { fakeGridLlmJson } from "./fake-grid-llm";

const grid10 = { x: 10, y: 10 };

describe("fakeGridLlmJson", () => {
  it("renvoie clear pour « vide »", async () => {
    const raw = await fakeGridLlmJson("vide tout", grid10);
    expect(parseGridCommandJson(raw)).toEqual({
      ok: true,
      command: { action: "clear" },
    });
  });

  it("renvoie setAlive avec planeur pour « planeur »", async () => {
    const raw = await fakeGridLlmJson("un planeur", grid10);
    const parsed = parseGridCommandJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const { command } = parsed;
    expect(command.action).toBe("setAlive");
    if (command.action === "setAlive") {
      expect(command.cells).toHaveLength(5);
    }
  });

  it("champ vide → planeur", async () => {
    const raw = await fakeGridLlmJson("  ", grid10);
    const parsed = parseGridCommandJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.command.action).toBe("setAlive");
  });

  it("texte quelconque → clignotant (3 cellules si largeur ≥ 3)", async () => {
    const raw = await fakeGridLlmJson("hello", grid10);
    const parsed = parseGridCommandJson(raw);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    const { command } = parsed;
    expect(command.action).toBe("setAlive");
    if (command.action === "setAlive") {
      expect(command.cells).toHaveLength(3);
    }
  });
});
