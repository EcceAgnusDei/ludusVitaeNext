import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Ludus Vitae",
};

export default function PolitiqueConfidentialitePage() {
  return (
    <div className="mx-auto flex max-w-2xl flex-1 flex-col gap-4 px-4 py-16">
      <h1 className="font-heading text-xl font-semibold">
        Politique de confidentialité
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Le texte juridique complet sera repris depuis l’application précédente
        lors de la migration du contenu statique.
      </p>
      <Link href="/" className="text-primary text-sm underline-offset-4 hover:underline">
        ← Accueil
      </Link>
    </div>
  );
}
