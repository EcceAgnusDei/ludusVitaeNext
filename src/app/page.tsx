import Link from "next/link";

import { SiteHeader } from "@/components/site-header";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <SiteHeader />
      <main className="mx-auto flex max-w-3xl flex-1 flex-col justify-center gap-4 px-4 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">
          Application en migration vers Next.js
        </h1>
        <p className="text-muted-foreground max-w-xl text-sm leading-relaxed">
          L’authentification Better Auth est disponible sur cette origine
          (connexion / inscription). La page jeu est disponible ; les autres
          écrans (grilles, mon espace) suivront.
        </p>
        <ul className="text-muted-foreground list-inside list-disc text-sm">
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/recents"
            >
              Récents
            </Link>
          </li>
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/populaires"
            >
              Populaires
            </Link>
          </li>
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/jeu"
            >
              Jeu
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
