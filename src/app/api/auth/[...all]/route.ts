/**
 * Point d’entrée HTTP Better Auth : toutes les routes `/api/auth/*` sont
 * dispatchées ici (App Router catch-all `[...all]`).
 *
 * @see https://better-auth.com/docs/integrations/next
 */
import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/** Pool PG, cookies, chiffrement : exécution Node uniquement. */
export const runtime = "nodejs";

/** La session ne doit jamais être servie depuis le cache route/data. */
export const dynamic = "force-dynamic";

const { GET, POST, PATCH, PUT, DELETE } = toNextJsHandler(auth);

export { GET, POST, PATCH, PUT, DELETE };
