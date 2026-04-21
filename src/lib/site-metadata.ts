import type { Metadata } from "next";

/** Nom du site / marque : éditeur, `og:site_name`, suffixe des onglets (`… | …`). */
export const siteName = "Gaudium de Veritate";

/** Titre principal du produit : l’automate (type Jeu de la vie de Conway). */
export const siteMainTitle = "Jeu de la vie";

export const siteDefaultDescription =
  "Automate cellulaire inspiré du Jeu de la vie de Conway : dessinez, simulez des grilles et partagez vos créations avec la communauté.";

/** Titre document (<title>) et Open Graph pour la page d’accueil. */
export const homeDocumentTitle = `${siteMainTitle} — automate cellulaire`;

/**
 * Origine publique du site pour `metadataBase` et URLs Open Graph.
 * @see .env.example — `NEXT_PUBLIC_APP_URL`
 */
export function getSiteOrigin(): string {
  const fromEnv = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (fromEnv) return fromEnv.replace(/\/+$/, "");
  const vercel = process.env.VERCEL_URL?.trim();
  if (vercel) return `https://${vercel.replace(/\/+$/, "")}`;
  return "http://localhost:3000";
}

/**
 * Métadonnées de route : titre segment (complété par le template du layout),
 * description, Open Graph et Twitter alignés sur le partage.
 */
export function pageMetadata(input: {
  path: `/${string}`;
  titleSegment: string;
  description: string;
}): Metadata {
  const fullTitle = `${siteMainTitle} | ${input.titleSegment}`;
  return {
    title: input.titleSegment,
    description: input.description,
    openGraph: {
      title: fullTitle,
      description: input.description,
      url: input.path,
    },
    twitter: {
      card: "summary",
      title: fullTitle,
      description: input.description,
    },
  };
}

/** Accueil : titre complet sans appliquer le template `%s | …` du layout. */
export function homeMetadata(input: {
  title: string;
  description: string;
}): Metadata {
  return {
    title: { absolute: input.title },
    description: input.description,
    openGraph: {
      title: input.title,
      description: input.description,
      url: "/",
    },
    twitter: {
      card: "summary",
      title: input.title,
      description: input.description,
    },
  };
}
