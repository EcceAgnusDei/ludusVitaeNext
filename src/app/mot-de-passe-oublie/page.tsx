import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Mot de passe oublié — Ludus Vitae",
  description:
    "La réinitialisation du mot de passe par e-mail n’est pas encore disponible sur ce site.",
};

export default function MotDePasseOubliePage() {
  return (
    <div className="mx-auto flex max-w-md flex-1 flex-col justify-center gap-4 px-4 py-16">
      <h1 className="font-heading text-xl font-semibold">
        Mot de passe oublié
      </h1>
      <p className="text-muted-foreground text-sm leading-relaxed">
        Cette fonctionnalité n’est pas encore disponible. En cas de nécessité
        (accès à un compte existant, etc.), vous pouvez me contacter : les
        coordonnées utiles figurent dans les{" "}
        <Link
          href="/mentions-legales"
          className="text-primary underline-offset-4 hover:underline"
        >
          mentions légales
        </Link>
        .
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
