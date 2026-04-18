import type { Metadata } from "next";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Ludus Vitae — automate cellulaire",
  description:
    "Un automate cellulaire inspiré du Jeu de la vie de Conway : dessinez, simulez et partagez vos grilles.",
};

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:py-12">
      <h1 className="font-heading mb-4 text-2xl font-semibold tracking-tight md:text-3xl">
        Ludus Vitae
      </h1>
      <p className="mb-8 text-lg text-muted-foreground">
        Un automate cellulaire inspiré du Jeu de la vie de Conway : des cellules
        naissent, survivent ou disparaissent à chaque génération selon quelques
        règles simples autour du voisinage.
      </p>

      <section className="mb-8 space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Les règles à chaque génération
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          On compte les voisins sur les{" "}
          <strong className="font-medium text-foreground">8 cases</strong>{" "}
          adjacentes (y compris en diagonale), sans compter la cellule elle-même.
        </p>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed">
          <li>
            <strong className="font-medium text-foreground">Survie</strong> : une
            cellule vivante reste vivante si elle a{" "}
            <strong className="font-medium text-foreground">2 ou 3</strong> voisins
            vivants.
          </li>
          <li>
            <strong className="font-medium text-foreground">Mort</strong> : une
            cellule vivante meurt si elle a moins de 2 voisins vivants (
            <strong className="font-medium text-foreground">isolement</strong>) ou
            plus de 3 (
            <strong className="font-medium text-foreground">surpopulation</strong>
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
          <span className="font-mono text-foreground">B3/S23</span> : naissance avec
          3 voisins, survie avec 2 ou 3.
        </p>
      </section>

      <section className="mb-8 space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Comment ça marche ?
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          Vous dessinez une configuration sur une grille en cliquant pour activer
          ou désactiver des cellules, puis vous lancez la simulation. Le temps
          s’écoule pas à pas ou en continu : observez les motifs stables, les
          oscillateurs et les structures qui évoluent sur plusieurs générations.
        </p>
      </section>

      <section className="mb-10 space-y-3">
        <h2 className="text-base font-semibold tracking-tight">
          Ce que vous pouvez faire ici
        </h2>
        <ul className="list-disc space-y-2 pl-5 text-muted-foreground leading-relaxed">
          <li>
            Choisir la taille de la grille et celle des cellules pour adapter
            l’affichage à votre écran.
          </li>
          <li>
            Mettre en pause, reprendre et régler la vitesse pour explorer une
            évolution au rythme qui vous convient.
          </li>
          <li>
            Enregistrer une grille dans le navigateur ou, une fois connecté, la
            sauvegarder en ligne et la partager avec la communauté.
          </li>
          <li>
            Parcourir les grilles récentes ou populaires et rouvrir une création
            directement dans le jeu.
          </li>
        </ul>
      </section>

      <div className="flex flex-col items-start gap-4 border-t pt-8">
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
