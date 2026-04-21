import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import {
  homeDocumentTitle,
  homeMetadata,
  siteMainTitle,
} from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

export const metadata = homeMetadata({
  title: homeDocumentTitle,
  description:
    "Un automate cellulaire inspiré du Jeu de la vie de Conway : créez, simulez et partagez vos créations.",
});

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 text-center md:py-12">
      <h1 className="font-heading mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
        {siteMainTitle}
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Un automate cellulaire inspiré du Jeu de la vie de Conway : des cellules
        naissent, survivent ou disparaissent à chaque génération selon quelques
        règles simples autour du voisinage.
      </p>
      <section className="mb-8 space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Comment ça marche ?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Vous dessinez une configuration sur une grille en cliquant pour
          activer ou désactiver des cellules, puis vous lancez la simulation. Le
          temps s’écoule pas à pas ou en continu : observez les motifs stables,
          les oscillateurs et les structures qui évoluent sur plusieurs
          générations.
        </p>
        <p className="text-muted-foreground leading-relaxed">
          Si votre création vous plait, vous pouvez la sauvegarder et la
          partager avec la communauté.
        </p>
      </section>

      <section
        className="mb-10 space-y-3"
        aria-labelledby="home-community-title"
      >
        <h2
          id="home-community-title"
          className="text-base font-semibold tracking-tight"
        >
          Explorer la communauté
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Parcourez les créations publiques partagées par d’autres joueurs : les
          dernières publications ou celles qui ont le plus de succès, puis
          ouvrez une grille dans le simulateur pour la faire évoluer à votre
          tour.
        </p>
        <ul className="list-inside list-disc space-y-1.5 text-muted-foreground text-sm leading-relaxed">
          <li>
            <Link
              href="/recents"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Créations récentes
            </Link>
          </li>
          <li>
            <Link
              href="/populaires"
              className="text-foreground font-medium underline-offset-4 hover:underline"
            >
              Créations populaires
            </Link>
          </li>
        </ul>
      </section>
      <section className="mb-8 space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Comment votre création évolue ?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          On compte les voisins sur les{" "}
          <strong className="font-medium text-foreground">8 cases</strong>{" "}
          adjacentes (y compris en diagonale), sans compter la cellule
          elle-même.
        </p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground leading-relaxed">
          <li>
            <strong className="font-medium text-foreground">Survie</strong> :
            une cellule vivante reste vivante si elle a{" "}
            <strong className="font-medium text-foreground">2 ou 3</strong>{" "}
            voisins vivants.
          </li>
          <li>
            <strong className="font-medium text-foreground">Mort</strong> : une
            cellule vivante meurt si elle a moins de 2 voisins vivants (
            <strong className="font-medium text-foreground">isolement</strong>)
            ou plus de 3 (
            <strong className="font-medium text-foreground">
              surpopulation
            </strong>
            ).
          </li>
          <li>
            <strong className="font-medium text-foreground">Naissance</strong> :
            une cellule morte devient vivante si elle a exactement{" "}
            <strong className="font-medium text-foreground">3</strong> voisins
            vivants.
          </li>
        </ul>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Ces règles se notent souvent{" "}
          <span className="font-mono text-foreground">B3/S23</span> : naissance
          avec 3 voisins, survie avec 2 ou 3.
        </p>
      </section>

      <div className="flex flex-col items-center gap-4 border-t pt-8">
        <p className="text-sm text-muted-foreground">
          Prêt à expérimenter ? Ouvrez l’aire de jeu.
        </p>
        <Link
          href="/jeu"
          className={cn(buttonVariants({ variant: "default", size: "lg" }))}
        >
          Jouer
        </Link>
      </div>
    </main>
  );
}
