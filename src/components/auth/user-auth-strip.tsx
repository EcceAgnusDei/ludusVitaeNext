"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { authClient } from "@/lib/auth-client";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Bandeau minimal : session côté client + déconnexion (accueil / layout futur). */
export function UserAuthStrip() {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  if (isPending) {
    return (
      <span className="text-muted-foreground text-sm">Chargement…</span>
    );
  }

  if (session?.user) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted-foreground max-w-[12rem] truncate sm:max-w-xs">
          {session.user.name ?? session.user.email}
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            void authClient.signOut().then(() => router.refresh());
          }}
        >
          Déconnexion
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link
        href="/connexion"
        className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
      >
        Connexion
      </Link>
      <Link
        href="/inscription"
        className={cn(buttonVariants({ variant: "default", size: "sm" }))}
      >
        Inscription
      </Link>
    </div>
  );
}
