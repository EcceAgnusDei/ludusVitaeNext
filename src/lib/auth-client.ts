/**Pour la traduction des messages d'erreur better auth en français*/
import { i18nClient } from "@better-auth/i18n/client";

import { createAuthClient } from "better-auth/react";

/** Origine de l’app (sans slash final), alignée avec `resolveBaseURL()` côté serveur. */
function resolveAuthClientOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  if (typeof window !== "undefined") return window.location.origin;
  return "http://localhost:3000";
}

export const authClient = createAuthClient({
  baseURL: resolveAuthClientOrigin(),
  plugins: [i18nClient()],
});
