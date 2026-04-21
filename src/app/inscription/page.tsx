import Link from "next/link";

import { SignUpForm } from "@/components/auth/sign-up-form";
import { pageMetadata } from "@/lib/site-metadata";

export const metadata = {
  ...pageMetadata({
    path: "/inscription",
    titleSegment: "Inscription",
    description: `Créez un compte pour sauvegarder vos créations en ligne et les partager.`,
  }),
  robots: { index: false, follow: true },
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
