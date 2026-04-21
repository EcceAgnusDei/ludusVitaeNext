"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

/* Chemins où le footer légal reste fixe en bas (listes longues / scroll infini). */
const STICKY_LEGAL_FOOTER_PATHS = new Set([
  "/recents",
  "/populaires",
  "/mon-espace",
  "/mon-espace/populaires",
  "/mon-espace/aimees",
]);

export function isStickyLegalFooterPath(pathname: string | null): boolean {
  if (!pathname) return false;
  return STICKY_LEGAL_FOOTER_PATHS.has(pathname);
}

export function BrowseMainPad({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const pathname = usePathname();
  const sticky = isStickyLegalFooterPath(pathname);

  return (
    <div
      className={cn(
        "flex min-h-0 w-full min-w-0 flex-1 flex-col",
        sticky &&
          "pb-[calc(2.75rem+env(safe-area-inset-bottom,0px))]",
      )}
    >
      {children}
    </div>
  );
}
