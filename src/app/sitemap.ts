import type { MetadataRoute } from "next";

import { getSiteOrigin } from "@/lib/site-metadata";

function absoluteUrl(path: string): string {
  const origin = getSiteOrigin().replace(/\/+$/, "");
  const pathname = path.startsWith("/") ? path : `/${path}`;
  return `${origin}${pathname}`;
}

/* Pages indexables : cœur produit + pages légales. Pas d’API, `/mon-espace` ni `/inscription`. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    { url: absoluteUrl("/"), lastModified, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/jeu"), lastModified, changeFrequency: "weekly", priority: 0.95 },
    {
      url: absoluteUrl("/populaires"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/recents"),
      lastModified,
      changeFrequency: "daily",
      priority: 0.85,
    },
    {
      url: absoluteUrl("/mentions-legales"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
    {
      url: absoluteUrl("/politique-confidentialite"),
      lastModified,
      changeFrequency: "yearly",
      priority: 0.2,
    },
  ];
}
