/* Message affiché quand `fetch` échoue (réseau, serveur arrêté, etc.). */
export const GRIDS_NETWORK_ERROR_MESSAGE =
  "Impossible de joindre le serveur. Vérifiez votre connexion.";

/*
 * Lit le corps JSON `{ error: string }` des réponses `/api/grids/*` en erreur.
 */
export async function messageFromGridsErrorResponse(
  res: Response,
): Promise<string> {
  let detail = "";
  try {
    const text = await res.text();
    if (text) {
      const parsed = JSON.parse(text) as { error?: unknown };
      if (typeof parsed.error === "string") detail = parsed.error;
    }
  } catch {
    /* ignore */
  }
  if (res.status === 401) {
    return "Session expirée ou non connecté.";
  }
  if (detail.length > 0) return detail;
  if (res.status >= 500) {
    return "Le serveur est temporairement indisponible. Réessayez plus tard.";
  }
  return "Action impossible pour le moment. Réessayez.";
}
