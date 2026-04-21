import Link from "next/link";

import { pageMetadata, siteName } from "@/lib/site-metadata";

export const metadata = pageMetadata({
  path: "/mentions-legales",
  titleSegment: "Mentions légales",
  description: `Informations LCEN : éditeur, hébergeur du site et hébergement des données — ${siteName}.`,
});

/*
 * Renseignez ces champs pour vos mentions légales (LCEN).
 * Site édité par une personne physique, sans personne morale exploitante.
 */
const EDITEUR = {
  nom: "",
  prenom: "",
  adresse: "", // domicile (adresse postale complète)
  email: "",
  telephone: "",
};

const HERBERGEUR_SITE = {
  raisonSociale: "",
  adresse: "",
  telephone: "",
};

/*
 * Si les données traitées via le site (fichiers, base de données, etc.) sont
 * stockées chez un prestataire distinct de l’hébergeur des pages web,
 * indiquez ses coordonnées. Sinon, laissez vide : le bloc affichera que
 * l’hébergement des données est assuré par le même hébergeur que le site.
 */
const HERBERGEUR_DONNEES = {
  distinct: false,
  raisonSociale: "",
  adresse: "",
  telephone: "",
};

function Valeur({ value }: { value: string }) {
  const t = value.trim();
  return (
    <span className="text-foreground">
      {t ? t : <span className="text-muted-foreground italic">[à compléter]</span>}
    </span>
  );
}

export default function MentionsLegalesPage() {
  return (
    <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8 md:py-12">
        <p className="mb-6">
          <Link
            href="/"
            className="text-primary text-sm underline-offset-4 hover:underline"
          >
            ← Retour à l’accueil
          </Link>
        </p>

        <h1 className="font-heading mb-2 text-2xl font-semibold tracking-tight md:text-3xl">
          Mentions légales
        </h1>
        <p className="text-muted-foreground mb-10 text-sm">
          Informations prévues par la loi pour la confiance dans l’économie
          numérique (LCEN), notamment son article&nbsp;6 et, le cas échéant,
          l’article&nbsp;6&nbsp;I&nbsp;1° bis (hébergement des données).
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              Éditeur du site
            </h2>
            <p className="text-muted-foreground">
              Le site est édité à titre personnel, sans activité exercée par une
              personne morale au sens du droit des sociétés.
            </p>
            <dl className="grid gap-2 border-l-2 border-border pl-4">
              <div>
                <dt className="text-muted-foreground">Nom et prénom</dt>
                <dd>
                  <Valeur value={`${EDITEUR.prenom} ${EDITEUR.nom}`.trim()} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Adresse</dt>
                <dd>
                  <Valeur value={EDITEUR.adresse} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Courriel</dt>
                <dd>
                  <Valeur value={EDITEUR.email} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd>
                  <Valeur value={EDITEUR.telephone} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              Hébergeur du site internet
            </h2>
            <p className="text-muted-foreground">
              Fournisseur auprès duquel sont stockées les pages et fichiers
              servis aux visiteurs (hébergement du site).
            </p>
            <dl className="grid gap-2 border-l-2 border-border pl-4">
              <div>
                <dt className="text-muted-foreground">Raison sociale ou nom</dt>
                <dd>
                  <Valeur value={HERBERGEUR_SITE.raisonSociale} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Adresse</dt>
                <dd>
                  <Valeur value={HERBERGEUR_SITE.adresse} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Téléphone</dt>
                <dd>
                  <Valeur value={HERBERGEUR_SITE.telephone} />
                </dd>
              </div>
            </dl>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              Hébergement des données traitées via le site
            </h2>
            <p className="text-muted-foreground">
              Lorsque des données (y compris non personnelles) sont stockées par
              un prestataire autre que l’hébergeur des pages web, la LCEN impose
              d’en indiquer l’identité et l’adresse. Sinon, un seul hébergeur peut
              regrouper les deux fonctions.
            </p>
            {HERBERGEUR_DONNEES.distinct ? (
              <dl className="grid gap-2 border-l-2 border-border pl-4">
                <div>
                  <dt className="text-muted-foreground">Raison sociale ou nom</dt>
                  <dd>
                    <Valeur value={HERBERGEUR_DONNEES.raisonSociale} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Adresse</dt>
                  <dd>
                    <Valeur value={HERBERGEUR_DONNEES.adresse} />
                  </dd>
                </div>
                <div>
                  <dt className="text-muted-foreground">Téléphone</dt>
                  <dd>
                    <Valeur value={HERBERGEUR_DONNEES.telephone} />
                  </dd>
                </div>
              </dl>
            ) : (
              <p className="text-foreground border-l-2 border-border pl-4">
                Les données traitées dans le cadre du site sont hébergées par le
                même prestataire que l’hébergeur du site indiqué ci-dessus (à
                adapter si votre situation est différente : passez{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  HERBERGEUR_DONNEES.distinct
                </code>{" "}
                à{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">true</code>{" "}
                et renseignez les champs).
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              Propriété intellectuelle
            </h2>
            <p className="text-muted-foreground">
              Sauf mention contraire, les contenus originaux du site (textes,
              visuels, code, etc.) sont la propriété de l’éditeur ou utilisés avec
              autorisation. Toute reproduction non autorisée peut constituer une
              contrefaçon.
            </p>
          </section>
        </div>
    </main>
  );
}
