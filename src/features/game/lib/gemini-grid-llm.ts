import { FinishReason, GoogleGenerativeAI } from "@google/generative-ai";

import { MAX_GRID_CELLS } from "@/features/game/lib/grid-command";
import type { GridCoord } from "@/features/game/lib/grid-handle-snapshot";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";

const SYSTEM_INSTRUCTION = `Tu es un générateur de commandes pour un conception d'un automate cellulaire type Jeu de la vie de Conway.

Règles du Jeu de la vie (Conway) :
- Voisinage : 8 voisins (horizontal, vertical, diagonal).
- Survie : une cellule vivante reste vivante si elle a 2 ou 3 voisins vivants.
- Naissance : une cellule morte devient vivante si elle a exactement 3 voisins vivants.
- Mort : sinon (sous/surpopulation), elle meurt ou reste morte.
- Important : tu ne fais pas « évoluer » automatiquement la grille (générations) sauf si l’utilisateur le demande explicitement.
- Ton role est d'inventer des coordonnées de cellules vivantes qui réalisent ce que l'utilisateur demande.

Règles strictes :
- Coordonnées entières en 1-based : x de 1 à gridSize.x, y de 1 à gridSize.y (avant resize) ; après un resize, les coordonnées de setAlive sont dans la nouvelle largeur × hauteur.
- Tu réponds par UN SEUL objet JSON, sans markdown, sans texte avant ou après.
- Format obligatoire : { "commands": [ ... ] } avec au moins une commande.

Types de commandes (clés en anglais), seulement ces deux actions :
1) { "action": "resize", "width": number, "height": number } — redimensionne la grille (entiers ≥ 1, width × height ≤ ${MAX_GRID_CELLS}). Les cellules hors du nouveau rectangle sont perdues.
2) { "action": "setAlive", "cells": [ { "x", "y" }, ... ] } — remplace entièrement l’ensemble des cellules vivantes par cette liste (grille entièrement décrite par cette commande).

Ordre :
- Au plus une commande de chaque type.
- Si resize et setAlive sont toutes les deux présentes : les coordonnées de setAlive doivent être valides pour la grille **après** le resize (le serveur exécute toujours resize avant setAlive, même si tu listes setAlive en premier dans le JSON).

Interprète la demande (souvent en français) à partir du contexte (gridSize, aliveCells, userRequest).
Pour « vider la grille », utilise setAlive avec "cells": [].`;

function resolveModelName(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_MODEL;
}
export async function geminiGridCommandJson(
  apiKey: string,
  userPrompt: string,
  gridSize: GridCoord,
  aliveCells: GridCoord[],
): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: resolveModelName(),
    systemInstruction: SYSTEM_INSTRUCTION,
    generationConfig: {
      temperature: 0.25,
      maxOutputTokens: 8192,
      responseMimeType: "application/json",
    },
  });

  const context = JSON.stringify(
    {
      gridSize,
      aliveCells,
      userRequest: userPrompt,
    },
    null,
    0,
  );

  const result = await model.generateContent(
    `Produis uniquement l'objet JSON { "commands": [ ... ] } pour ce contexte (si resize + setAlive : coordonnées de setAlive = grille après resize) :\n${context}`,
  );

  const response = result.response;
  const candidates = response.candidates;
  const first = candidates?.[0];
  if (first?.finishReason && first.finishReason !== FinishReason.STOP) {
    throw new Error(`Gemini : génération interrompue (${first.finishReason}).`);
  }

  const text = response.text()?.trim();
  if (!text) {
    throw new Error("Gemini : réponse vide.");
  }

  return text;
}
