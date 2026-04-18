import Link from "next/link";

import { UserAuthStrip } from "@/components/auth/user-auth-strip";
import { MonEspaceHeaderLink } from "@/components/mon-espace-header-link";
import { cn } from "@/lib/utils";

const navLinkClass =
  "text-muted-foreground hover:text-foreground text-sm transition-colors";

export function SiteHeader() {
  return (
    <header className="border-b px-4 py-3">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-6">
          <Link href="/" className="font-heading text-base font-semibold">
            Ludus Vitae
          </Link>
          <nav className="flex flex-wrap items-center gap-4" aria-label="Principal">
            <Link href="/recents" className={cn(navLinkClass)}>
              Récents
            </Link>
            <Link href="/populaires" className={cn(navLinkClass)}>
              Populaires
            </Link>
            <Link href="/jeu" className={cn(navLinkClass)}>
              Jeu
            </Link>
            <MonEspaceHeaderLink className={cn(navLinkClass)} />
          </nav>
        </div>
        <UserAuthStrip />
      </div>
    </header>
  );
}
