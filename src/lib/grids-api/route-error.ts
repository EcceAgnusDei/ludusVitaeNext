import { NextResponse } from "next/server";

/* Réponse 500 JSON homogène pour les erreurs non gérées des routes `/api/grids/*`. */
export function gridsInternalErrorResponse(): NextResponse {
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

/*
 * Exécute un handler async ; en cas d’exception, log et renvoie {@link gridsInternalErrorResponse}.
 * Les erreurs métier (400, 404, etc.) restent des `return` explicites dans le callback.
 */
export async function withGridsRouteErrors(
  run: () => Promise<Response | NextResponse>,
): Promise<Response | NextResponse> {
  try {
    return await run();
  } catch (e) {
    console.error(e);
    return gridsInternalErrorResponse();
  }
}
