import { NextResponse } from "next/server";

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
