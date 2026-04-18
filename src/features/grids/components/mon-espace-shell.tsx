"use client";

import { useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

const TABS: { href: string; label: string; end: boolean }[] = [
  { href: "/mon-espace", label: "Récentes", end: true },
  { href: "/mon-espace/populaires", label: "Populaires", end: false },
  { href: "/mon-espace/aimees", label: "J’aime", end: false },
];

function tabActive(pathname: string, href: string, end: boolean) {
  if (end) return pathname === href;
  return pathname === href;
}

export function MonEspaceShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  useEffect(() => {
    if (sessionPending) return;
    if (!session?.user) {
      router.replace("/");
    }
  }, [session?.user, sessionPending, router]);

  if (sessionPending) {
    return (
      <main className="flex w-full min-w-0 flex-1 flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">Chargement…</p>
      </main>
    );
  }

  if (!session?.user) {
    return (
      <main className="flex w-full min-w-0 flex-1 flex-col items-center justify-center p-6">
        <p className="text-muted-foreground">Redirection…</p>
      </main>
    );
  }

  return (
    <main className="flex w-full min-w-0 flex-1 flex-col gap-6 p-6">
      <div className="mx-auto flex w-full max-w-2xl flex-col items-center gap-6 text-center">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Mon espace</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Vos grilles enregistrées et les grilles que vous avez aimées.
          </p>
        </div>

        <nav
          aria-label="Sections Mon espace"
          className="flex flex-wrap justify-center gap-2"
        >
          {TABS.map(({ href, label, end }) => {
            const active = tabActive(pathname, href, end);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  buttonVariants({ variant: "ghost", size: "default" }),
                  "h-auto min-h-0 rounded-full px-4 py-2.5 text-sm whitespace-normal",
                  active && "bg-muted text-foreground",
                )}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>

      {children}
    </main>
  );
}
