/*
 * Authentification pour les Route Handlers `/api/grids/*`.
 *
 * Règles :
 * - L’identité autorisée vient uniquement de la session Better Auth (`getServerSession`), jamais du corps
 *   de requête ni d’en-têtes applicatifs arbitraires.
 * - `getViewerId` : lorsque la session n'est pas obligatoire mais qu'elle change l'ui si elle existe
 * - `requireUserId` : session obligatoire ; réponse 401 JSON alignée sur l’API Express historique.
 */

import { NextResponse } from "next/server";

import { getServerSession } from "@/lib/session";

export const GRIDS_UNAUTHORIZED_JSON = { error: "Non autorisé" } as const;

function isNonEmptyUserId(value: unknown): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= 256;
}

/*
 * Identifiant du visiteur connecté, ou `null` (anonyme).
 * Ne lit que la session serveur.
 */
export async function getViewerId(): Promise<string | null> {
  const session = await getServerSession();
  const id = session?.user?.id;
  return isNonEmptyUserId(id) ? id : null;
}

export type RequireUserIdResult =
  | { ok: true; userId: string }
  | { ok: false; response: NextResponse };

/*
 * Exige une session valide. Utiliser le `userId` retourné pour toute écriture métier
 * (création, suppression, like, etc.) — ne pas prendre d’identité depuis le client.
 */
export async function requireUserId(): Promise<RequireUserIdResult> {
  const session = await getServerSession();
  const id = session?.user?.id;
  if (!isNonEmptyUserId(id)) {
    return {
      ok: false,
      response: NextResponse.json(GRIDS_UNAUTHORIZED_JSON, { status: 401 }),
    };
  }
  return { ok: true, userId: id };
}
