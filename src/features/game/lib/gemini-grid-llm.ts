import { FinishReason, GoogleGenerativeAI } from "@google/generative-ai";

import type { GridCoord } from "@/features/game/lib/grid-handle-snapshot";

const DEFAULT_MODEL = "gemini-2.5-flash-lite";
//const DEFAULT_MODEL = "gemini-2.5-flash";
//const DEFAULT_MODEL = "gemini-2.5-pro";

const SYSTEM_INSTRUCTION = `Tu es un générateur d'états de grille pour un automate cellulaire type Jeu de la vie de Conway.

Règles du Jeu de la vie (Conway) :
- Voisinage : 8 voisins (horizontal, vertical, diagonal).
- Survie : une cellule vivante reste vivante si elle a 2 ou 3 voisins vivants.
- Naissance : une cellule morte devient vivante si elle a exactement 3 voisins vivants.
- Mort : sinon (sous/surpopulation), elle meurt ou reste morte.
- Important : tu ne fais pas « évoluer » automatiquement la grille (générations) sauf si l'utilisateur le demande explicitement.
- Ton rôle est d'inventer des coordonnées de cellules vivantes qui réalisent ce que l'utilisateur demande.

Règles strictes :
- Coordonnées entières en 1-based (x ≥ 1, y ≥ 1).
- Tu réponds par UN SEUL objet JSON, sans markdown, sans texte avant ou après.
- Format obligatoire : { "gridSize": { "x": number, "y": number }, "aliveCells": [ { "x", "y" }, ... ], "comment": string }
- gridSize : dimensions souhaitées de la grille (entiers ≥ 1). Adapte la taille si la demande le nécessite.
- aliveCells : liste complète et définitive des cellules vivantes (remplace entièrement l'état précédent). Le client agrandira la grille si des cellules dépassent gridSize.
- "comment" est optionnel : ne mets un commentaire que si tu n'es pas sur de répondre tout à fait à la demande, une phrase ou deux, pas plus.
- Pour « vider la grille », renvoie "aliveCells": [] (tu peux conserver ou ajuster gridSize selon le contexte).
- Fais en sorte que les coordonnées que tu renvoie ne soient pas près des bords, sauf si l'utilisateur le demande explicitement.

Interprète la demande (souvent en français) à partir du contexte (gridSize, aliveCells, userRequest).`;

function resolveModelName(): string {
  const fromEnv = process.env.GEMINI_MODEL?.trim();
  return fromEnv && fromEnv.length > 0 ? fromEnv : DEFAULT_MODEL;
}

function geminiErrorMessage(err: unknown): string {
  if (err instanceof Error && err.message.trim()) {
    return err.message.trim();
  }
  if (err && typeof err === "object") {
    const o = err as Record<string, unknown>;
    if (typeof o.message === "string" && o.message.trim()) {
      return o.message.trim();
    }
    const nested = o.error;
    if (nested && typeof nested === "object") {
      const msg = (nested as { message?: unknown }).message;
      if (typeof msg === "string" && msg.trim()) return msg.trim();
    }
  }
  return "Erreur inconnue.";
}
export async function geminiGridStateJson(
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

  let result;
  try {
    result = await model.generateContent(
      `Produis uniquement l'objet JSON { "gridSize": { "x", "y" }, "aliveCells": [ ... ], "comment"?: "..." } pour ce contexte :\n${context}`,
    );
  } catch (err) {
    throw new Error(`Serveur IA : ${geminiErrorMessage(err)}`);
  }

  const response = result.response;
  const candidates = response.candidates;
  const first = candidates?.[0];
  if (first?.finishReason && first.finishReason !== FinishReason.STOP) {
    throw new Error(
      `Serveur IA : génération interrompue (${first.finishReason}).`,
    );
  }

  let text: string | undefined;
  try {
    text = response.text()?.trim();
  } catch (err) {
    throw new Error(`Serveur IA : ${geminiErrorMessage(err)}`);
  }

  if (!text) {
    throw new Error("Serveur IA : réponse vide.");
  }

  return text;
}
