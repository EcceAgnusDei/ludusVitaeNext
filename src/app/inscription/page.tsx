import type { Metadata } from "next";
import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";

export const metadata: Metadata = {
  title: "Inscription — Ludus Vitae",
  description: "Créez un compte Ludus Vitae.",
};

export default function InscriptionPage() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-4 py-16">
      <SignUpForm />
      <Link
        href="/"
        className="text-muted-foreground text-sm underline-offset-4 hover:underline"
      >
        ← Retour à l’accueil
      </Link>
    </div>
  );
}
