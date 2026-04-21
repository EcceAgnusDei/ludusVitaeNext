import Link from "next/link";

import { siteMainTitle } from "@/lib/site-metadata";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Bloc de contenu statique (RSC) au-dessus de l’aire de jeu : visible pour les
 * utilisateurs et les crawlers sans exécuter le client du simulateur.
 */
export function JeuStaticIntro() {
  return (
    <section
      aria-labelledby="jeu-page-title"
      className="border-border shrink-0 border-b px-4 py-5 md:py-6"
    >
      <div className="mx-auto max-w-3xl space-y-3 text-center">
        <h1
          id="jeu-page-title"
          className="font-heading text-xl font-semibold tracking-tight md:text-2xl"
        >
          {siteMainTitle} — simulateur en ligne
        </h1>
        <p className="text-muted-foreground text-sm leading-relaxed md:text-base">
          Dessinez des cellules sur la grille, lancez la simulation et observez
          l’évolution génération après génération. Si vous êtes connecté, vous
          pourrez donner un nom, sauvegarder et partager votre création.
        </p>
        <div className="flex justify-center pt-1">
          <Link
            href="/"
            className={cn(
              buttonVariants({ variant: "link" }),
              "text-muted-foreground inline-flex h-auto min-h-0 px-0 py-0 text-sm font-normal underline-offset-4 hover:text-foreground",
            )}
          >
            Règles et présentation
          </Link>
        </div>
      </div>
    </section>
  );
}
