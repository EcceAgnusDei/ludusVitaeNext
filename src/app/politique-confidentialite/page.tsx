import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { pageMetadata, siteName } from "@/lib/site-metadata";
import { cn } from "@/lib/utils";

export const metadata = pageMetadata({
  path: "/politique-confidentialite",
  titleSegment: "Politique de confidentialité",
  description: `Traitement des données personnelles sur ${siteName} (RGPD, loi Informatique et libertés).`,
});

/**
 * Personne qui détermine les finalités et les moyens du traitement (RGPD).
 * À aligner avec l’éditeur du site (mentions légales).
 */
const RESPONSABLE = {
  nom: "",
  prenom: "",
  adresse: "",
  email: "", // idéalement une adresse dédiée type contact-donnees@…
};

/** Délégué à la protection des données — laisser vide si vous n’en avez pas nommé. */
const DPO = {
  nom: "",
  email: "",
};

function Valeur({ value }: { value: string }) {
  const t = value.trim();
  return (
    <span className="text-foreground">
      {t ? t : <span className="text-muted-foreground italic">[à compléter]</span>}
    </span>
  );
}

export default function PolitiqueConfidentialitePage() {
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
          Politique de confidentialité
        </h1>
        <p className="text-muted-foreground mb-10 text-sm">
          Cette page décrit comment sont traitées les données personnelles dans le
          cadre du site, conformément au règlement (UE) 2016/679 (RGPD) et à la loi
          « Informatique et libertés ». Dernière mise à jour :{" "}
          <span className="text-muted-foreground italic">[date à compléter]</span>
          .
        </p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              1. Responsable du traitement
            </h2>
            <p className="text-muted-foreground">
              Le responsable du traitement des données est la personne physique qui
              édite le service :
            </p>
            <dl className="grid gap-2 border-l-2 border-border pl-4">
              <div>
                <dt className="text-muted-foreground">Identité</dt>
                <dd>
                  <Valeur value={`${RESPONSABLE.prenom} ${RESPONSABLE.nom}`.trim()} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Adresse</dt>
                <dd>
                  <Valeur value={RESPONSABLE.adresse} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">
                  Contact (données personnelles)
                </dt>
                <dd>
                  <Valeur value={RESPONSABLE.email} />
                </dd>
              </div>
            </dl>
            {DPO.nom.trim() || DPO.email.trim() ? (
              <p className="text-muted-foreground">
                Délégué à la protection des données (DPO) : <Valeur value={DPO.nom} />
                {DPO.email.trim() ? (
                  <>
                    {" "}
                    — <Valeur value={DPO.email} />
                  </>
                ) : null}
              </p>
            ) : (
              <p className="text-muted-foreground">
                Aucun DPO n’a été désigné (non obligatoire dans tous les cas ; à
                vérifier selon votre activité et le volume de traitements).
              </p>
            )}
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              2. Quelles données sont collectées ?
            </h2>
            <p className="text-muted-foreground">
              Selon votre utilisation du site, peuvent notamment être traitées :
            </p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 pl-1">
              <li>
                <strong className="text-foreground">Compte utilisateur</strong> :
                identifiant / pseudo, adresse e-mail, mot de passe (stocké sous
                forme dérivée sécurisée, non en clair).
              </li>
              <li>
                <strong className="text-foreground">Contenus et activité</strong>{" "}
                : grilles ou créations publiées, interactions éventuelles (likes,
                favoris, etc.) — adaptez cette liste à votre produit réel.
              </li>
              <li>
                <strong className="text-foreground">
                  Réinitialisation de mot de passe
                </strong>{" "}
                : traitement de l’e-mail pour envoyer un lien ou un code.
              </li>
              <li>
                <strong className="text-foreground">Données techniques</strong> :
                journaux serveur (adresse IP, date/heure de requêtes), cookies ou
                stockages locaux nécessaires à la session ou à la sécurité — voir
                la section 7.
              </li>
            </ul>
            <p className="text-muted-foreground italic">
              [À compléter : toute autre donnée (newsletter, support, analytics,
              etc.).]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              3. Pourquoi et sur quel fondement juridique ?
            </h2>
            <p className="text-muted-foreground">
              Chaque traitement doit avoir une <strong>finalité</strong> précise et
              une <strong>base légale</strong> parmi celles du RGPD (ex. exécution
              d’un contrat, intérêt légitime, obligation légale, consentement).
              Exemples types pour un site avec comptes :
            </p>
            <ul className="text-muted-foreground list-inside list-disc space-y-2 pl-1">
              <li>
                <strong className="text-foreground">
                  Gestion du compte et du service
                </strong>{" "}
                — base : exécution des mesures précontractuelles / du contrat
                (inscription, authentification, affichage de vos contenus).
              </li>
              <li>
                <strong className="text-foreground">
                  Sécurité, prévention des abus
                </strong>{" "}
                — base : intérêt légitime (sécurité du site et des utilisateurs).
              </li>
              <li>
                <strong className="text-foreground">E-mails transactionnels</strong>{" "}
                (validation, mot de passe oublié) — base : exécution du contrat ou
                intérêt légitime selon le cas.
              </li>
              <li>
                <strong className="text-foreground">
                  Cookies non nécessaires / statistiques
                </strong>{" "}
                — base : consentement, si vous en utilisez.
              </li>
            </ul>
            <p className="text-muted-foreground italic">
              [À compléter : tableau finalités / bases légales exact pour votre
              cas, avec un juriste ou la CNIL si besoin.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              4. À qui sont transmises les données ?
            </h2>
            <p className="text-muted-foreground">
              Les données sont traitées en priorité par le responsable du
              traitement. Peuvent intervenir des{" "}
              <strong className="text-foreground">sous-traitants</strong> (hébergeur
              du site et de la base de données, prestataire d’envoi d’e-mails,
              etc.), dans la stricte mesure nécessaire et avec des garanties
              contractuelles conformes au RGPD.
            </p>
            <p className="text-muted-foreground italic">
              [À compléter : nom ou catégories de sous-traitants et lien vers leurs
              politiques de confidentialité si vous les publiez.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              5. Transferts hors de l’Union européenne
            </h2>
            <p className="text-muted-foreground">
              Si un outil que vous utilisez héberge des données en dehors de l’EEE,
              indiquez-le et mentionnez les garanties (clauses types, décision
              d’adéquation, etc.).
            </p>
            <p className="text-muted-foreground italic">
              [À compléter : « Aucun transfert hors UE » ou détail par outil.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              6. Durées de conservation
            </h2>
            <p className="text-muted-foreground">
              Les données ne sont gardées que le temps nécessaire aux finalités
              ci-dessus (ex. durée de vie du compte + délais légaux ; journaux
              techniques limités dans le temps).
            </p>
            <p className="text-muted-foreground italic">
              [À compléter : durées précises ou critères de détermination par
              catégorie de données.]
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              7. Cookies et traceurs
            </h2>
            <p className="text-muted-foreground">
              Le site n’utilise{" "}
              <strong className="text-foreground">aucun cookie publicitaire</strong>
              ,{" "}
              <strong className="text-foreground">
                aucun traceur d’audience tiers
              </strong>{" "}
              (type Google Analytics, Meta Pixel, etc.) et{" "}
              <strong className="text-foreground">
                aucun widget de réseau social
              </strong>{" "}
              intégré aux pages, dans l’état actuel du code.
            </p>

            <h3 className="text-foreground pt-1 text-sm font-semibold">
              Cookies d’authentification (strictement nécessaires)
            </h3>
            <p className="text-muted-foreground">
              L’authentification repose sur{" "}
              <strong className="text-foreground">Better Auth</strong> côté
              serveur. Après connexion ou inscription, l’application dépose un ou
              plusieurs cookies sur le{" "}
              <strong className="text-foreground">domaine du site</strong>{" "}
              (même origine que les pages : application Next.js). Ils permettent de
              lier les requêtes authentifiées à votre session.
            </p>
            <ul className="text-muted-foreground list-inside list-disc space-y-1 pl-1">
              <li>
                <strong className="text-foreground">Finalité</strong> : maintenir la
                session et sécuriser l’accès aux fonctionnalités réservées aux
                comptes connectés.
              </li>
              <li>
                <strong className="text-foreground">Nom(s)</strong> : par défaut
                Better Auth utilise un préfixe{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  better-auth.
                </code>{" "}
                — notamment{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  better-auth.session_token
                </code>
                . D’autres noms du même préfixe peuvent apparaître selon les options
                internes (cache de session). En HTTPS, un préfixe{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  __Secure-
                </code>{" "}
                peut s’ajouter conformément aux conventions des navigateurs.
              </li>
              <li>
                <strong className="text-foreground">Durée</strong> : le jeton de
                session est configuré par défaut sur environ{" "}
                <strong className="text-foreground">7 jours</strong> côté Better
                Auth, sauf modification ultérieure de la configuration serveur.
              </li>
              <li>
                <strong className="text-foreground">Attributs</strong> :{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">HttpOnly</code>
                ,{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">
                  SameSite=Lax
                </code>
                ,{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">Path=/</code>
                , et indicateur{" "}
                <code className="bg-muted rounded px-1 py-0.5 text-xs">Secure</code>{" "}
                lorsque le site est servi en HTTPS — le contenu du cookie n’est pas
                lisible par le JavaScript de la page (réduction du risque lié au XSS).
              </li>
            </ul>
            <p className="text-muted-foreground">
              Ces cookies sont{" "}
              <strong className="text-foreground">
                indispensables au fonctionnement du service
              </strong>{" "}
              tel que vous le sollicitez (compte, connexion). Ils relèvent de
              l’exemption de consentement préalable pour les cookies strictement
              nécessaires au service demandé (cadre ePrivacy / pratique CNIL). Sans
              eux, la connexion persistante et les actions nécessitant un compte ne
              sont pas opérationnelles.
            </p>

            <h3 className="text-foreground pt-1 text-sm font-semibold">
              Stockage local du navigateur (
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                localStorage
              </code>
              )
            </h3>
            <p className="text-muted-foreground">
              Sur la page de jeu (Jeu de la vie), une action permet d’enregistrer
              l’état de la grille sous la clé{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">grid</code>{" "}
              dans le{" "}
              <code className="bg-muted rounded px-1 py-0.5 text-xs">
                localStorage
              </code>{" "}
              du navigateur (taille de la grille et coordonnées des cellules
              vivantes). Ces données servent uniquement à{" "}
              <strong className="text-foreground">
                retrouver localement une partie
              </strong>{" "}
              ; elles ne sont pas envoyées automatiquement au serveur par ce
              mécanisme. Vous pouvez les effacer via les paramètres du navigateur
              (données du site / stockage local).
            </p>

            <h3 className="text-foreground pt-1 text-sm font-semibold">
              Refus, suppression et évolutions
            </h3>
            <p className="text-muted-foreground">
              Vous pouvez bloquer ou supprimer les cookies dans les réglages du
              navigateur ; bloquer ceux du domaine du site empêchera en pratique de
              rester connecté. La{" "}
              <strong className="text-foreground">déconnexion</strong> depuis
              l’interface vise à terminer la session côté application.
            </p>
            <p className="text-muted-foreground">
              Si des cookies ou traceurs{" "}
              <strong className="text-foreground">non nécessaires</strong>{" "}
              (statistiques, publicité, réseaux sociaux, etc.) étaient ajoutés plus
              tard, cette section serait mise à jour et, le cas échéant, un choix
              préalable (bandeau ou équivalent) serait proposé conformément à la
              réglementation.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">8. Vos droits</h2>
            <p className="text-muted-foreground">
              Vous disposez notamment des droits d’accès, de rectification,
              d’effacement, de limitation, d’opposition (dans les conditions prévues
              par la loi), de portabilité pour les traitements fondés sur le
              consentement ou le contrat, et du droit de définir des directives
              relatives au sort de vos données après votre décès (en France).
            </p>
            <p className="text-muted-foreground">
              Pour exercer vos droits, contactez le responsable du traitement à
              l’adresse indiquée en section 1. Une pièce d’identité peut être demandée
              pour éviter la fraude.
            </p>
            <p className="text-muted-foreground">
              Vous pouvez aussi introduire une réclamation auprès de l’autorité de
              contrôle compétente. En France : la CNIL —{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className={cn(
                  buttonVariants({ variant: "link" }),
                  "inline h-auto min-h-0 p-0 font-normal",
                )}
              >
                www.cnil.fr
              </a>
              .
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">9. Sécurité</h2>
            <p className="text-muted-foreground">
              Des mesures techniques et organisationnelles appropriées sont mises en
              œuvre pour protéger les données contre la destruction accidentelle ou
              illicite, la perte, l’altération, la divulgation ou l’accès non autorisé
              (chiffrement en transit si HTTPS, hachage des mots de passe, accès
              restreint aux serveurs, etc. — décrivez ce qui correspond à votre
              déploiement).
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-foreground text-base font-semibold">
              10. Évolution de la politique
            </h2>
            <p className="text-muted-foreground">
              Cette politique peut être mise à jour ; la date en tête de page sera
              révisée. En cas de changement substantiel, une information sur le site
              ou par e-mail peut être prévue.
            </p>
          </section>

          <p className="text-muted-foreground border-border text-xs">
            Document d’information : adaptez-le à vos traitements réels. En cas de
            doute, rapprochez-vous de la{" "}
            <a
              href="https://www.cnil.fr/fr/rgpd-exemples-de-mentions-dinformation"
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ variant: "link" }),
                "inline h-auto min-h-0 p-0 text-xs font-normal",
              )}
            >
              documentation de la CNIL
            </a>{" "}
            ou d’un professionnel du droit.
          </p>
        </div>
    </main>
  );
}
