import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Ludus Vitae",
  description: "Réinitialisation du mot de passe (à venir).",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="font-heading text-xl font-semibold">
        Mot de passe oublié
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Le flux de réinitialisation par e-mail sera branché lors de la migration
        des routes dédiées (Resend / API). En attendant, contactez le support
        si besoin.
      </p>
      <Link
        href="/connexion"
        className="text-primary text-sm underline-offset-4 hover:underline"
      >
        ← Retour à la connexion
      </Link>
    </div>
  );
}
