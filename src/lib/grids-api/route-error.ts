import { NextResponse } from "next/server";

/* Réponse 500 JSON homogène pour les erreurs non gérées des routes `/api/grids/*`. */
export function gridsInternalErrorResponse(): NextResponse {
  return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
}

/*
 * Réponse 405 homogène pour les verbes HTTP non supportés sur une route grilles.
 * `allow` doit lister les méthodes autorisées (RFC 9110, en-tête `Allow`).
 */
export function gridsMethodNotAllowed(allow: string): NextResponse {
  return NextResponse.json(
    { error: "Méthode non autorisée pour cette ressource." },
    { status: 405, headers: { Allow: allow } },
  );
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
