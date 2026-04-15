import { headers } from "next/headers";
import { auth } from "@/lib/auth";

/** Session Better Auth côté serveur. Pour `/api/grids/*`, préférer `@/lib/grids/route-auth`. */
export async function getServerSession() {
  return auth.api.getSession({
    headers: await headers(),
  });
}
