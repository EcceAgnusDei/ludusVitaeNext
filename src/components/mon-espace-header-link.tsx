"use client";

import Link from "next/link";

import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";

type MonEspaceHeaderLinkProps = { className?: string };

export function MonEspaceHeaderLink({ className }: MonEspaceHeaderLinkProps) {
  const { data: session, isPending } = authClient.useSession();

  if (isPending || !session?.user) {
    return null;
  }

  return (
    <Link href="/mon-espace" className={cn(className)}>
      Mon espace
    </Link>
  );
}
