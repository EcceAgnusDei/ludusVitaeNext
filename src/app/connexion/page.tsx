import type { Metadata } from "next";
import Link from "next/link";

import { SignInForm } from "@/components/auth/sign-in-form";

export const metadata: Metadata = {
  title: "Connexion — Ludus Vitae",
  description: "Connectez-vous à votre compte Ludus Vitae.",
};

export default function ConnexionPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <SignInForm />
      <Link
        href="/"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Retour à l’accueil
      </Link>
    </div>
  );
}
