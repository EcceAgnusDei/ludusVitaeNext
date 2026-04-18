"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { isStickyLegalFooterPath } from "@/components/browse-main-pad";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function LegalLinksRow({ compact }: { compact?: boolean }) {
  const linkBtnClass = cn(
    "h-auto min-h-0 p-0 font-normal",
    compact ? "text-[11px] sm:text-xs" : "text-xs",
  );
  return (
    <div
      className={
        compact
          ? "flex flex-wrap items-center justify-center gap-x-3 gap-y-0.5 px-3 text-center"
          : "flex flex-wrap items-center justify-center gap-x-4 gap-y-2 px-4 text-center"
      }
    >
      <Link
        href="/mentions-legales"
        className={cn(buttonVariants({ variant: "link" }), linkBtnClass)}
      >
        Mentions légales
      </Link>
      <span className="text-muted-foreground hidden sm:inline" aria-hidden>
        ·
      </span>
      <Link
        href="/politique-confidentialite"
        className={cn(buttonVariants({ variant: "link" }), linkBtnClass)}
      >
        Politique de confidentialité
      </Link>
    </div>
  );
}

export function SiteFooter() {
  const pathname = usePathname();
  const sticky = isStickyLegalFooterPath(pathname);

  if (sticky) {
    return (
      <footer className="border-border fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 pt-1.5 backdrop-blur-sm supports-[backdrop-filter]:bg-background/80 pb-[calc(0.375rem+env(safe-area-inset-bottom,0px))]">
        <LegalLinksRow compact />
      </footer>
    );
  }

  return (
    <footer className="border-border mt-auto border-t py-4">
      <LegalLinksRow />
    </footer>
  );
}
