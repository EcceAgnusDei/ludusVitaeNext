import Link from "next/link";

import { UserAuthStrip } from "@/components/auth/user-auth-strip";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="border-b px-4 py-3">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
          <Link href="/" className="font-heading text-base font-semibold">
            Ludus Vitae
          </Link>
          <UserAuthStrip />
        </div>
      </header>
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
            <Link className="text-primary underline-offset-4 hover:underline" href="/jeu">
              Jeu
            </Link>
          </li>
          <li>
            <Link className="text-primary underline-offset-4 hover:underline" href="/connexion">
              Connexion
            </Link>
          </li>
          <li>
            <Link
              className="text-primary underline-offset-4 hover:underline"
              href="/inscription"
            >
              Inscription
            </Link>
          </li>
        </ul>
      </main>
    </div>
  );
}
