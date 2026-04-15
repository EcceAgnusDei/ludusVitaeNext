"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/** Après connexion ou inscription réussie : même origine, cookies visibles après refresh. */
export function PostAuthRedirect({ to = "/" }: { to?: string }) {
  const router = useRouter();
  useEffect(() => {
    router.replace(to);
    router.refresh();
  }, [router, to]);
  return (
    <p className="text-muted-foreground text-center text-sm">
      Redirection en cours…
    </p>
  );
}
