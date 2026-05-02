# Gaudium de Veritate — Jeu de la vie

Application web (Next.js) autour d’un **automate cellulaire** inspiré du [Jeu de la vie de Conway](https://fr.wikipedia.org/wiki/Jeu_de_la_vie) : dessiner une grille, lancer la simulation, enregistrer et parcourir des créations partagées.

## Fonctionnalités

- **Grille interactive** : édition et pas à pas de la simulation.
- **Sauvegarde** : grilles persistées côté serveur pour les comptes connectés.
- **Comptes** : inscription, connexion et réinitialisation de mot de passe (e-mails transactionnels via Resend).
- **Espace personnel** : grilles récentes, populaires, favoris.

## Prérequis

- **Node.js** 20+ (recommandé : aligné sur les `@types/node` du dépôt).
- **PostgreSQL** accessible via une URL de connexion (`DATABASE_URL`).

## Installation et lancement

1. **Cloner** le dépôt et se placer à la racine du projet.

2. **Installer les dépendances** :

   ```bash
   npm install
   ```

3. **Variables d’environnement** : copier `.env.example` vers `.env` et affecter les valeurs correspondantes.

4. **Schéma base de données** : avec une base vide, appliquer les migrations Drizzle (fichiers SQL dans `./drizzle`) :

   ```bash
   npm run db:migrate
   ```

   Pour un prototypage rapide sans fichier de migration, vous pouvez utiliser `npm run db:push` (voir la doc Drizzle — à réserver au dev).

5. **Lancer le serveur de développement** :

   ```bash
   npm run dev
   ```

## Tests

Trois niveaux coexistent : **unitaires** (Vitest), **intégration** (Vitest + PostgreSQL, auth simulée côté handler), **e2e** (Playwright + navigateur). Les commandes ci‑dessous utilisent **pnpm** (le dépôt contient un `pnpm-lock.yaml`) ; les scripts équivalents existent avec `npm run …`.

### Fonctionnalités couvertes

| Domaine                                                                                                                                | Type de test | Commentaire                                                  |
| -------------------------------------------------------------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------ |
| Moteur du jeu de la vie (règles, évolution de la grille)                                                                               | Unitaire     | Sans base ni navigateur ; logique pure.                      |
| API **DELETE** `/api/grids/[id]`, assurant qu'un utilisateur ne peut supprimer une création tier                                       | Intégration  | Handler HTTP réel, DB réelle, session mockée dans le test.   |
| Parcours **connexion → jeu → enregistrement en base → Mon espace**, assurant que la nouvelle grille est bien enregistrée et accessible | E2E          | Navigateur Chromium, Better Auth et API comme en production. |

Fichiers principaux : `src/features/game/lib/game-of-life.test.ts`, `src/app/api/grids/[id]/route.delete.integration.test.ts`, `e2e/grid-save-dashboard.spec.ts`.

### Lancer les tests

```bash
pnpm run test                 # Vitest : tous les *.test.ts et *.integration.test.ts listés par vitest.config
pnpm run test:integration     # Uniquement les tests d’intégration (*.integration.test.ts)
pnpm run test:e2e             # Playwright (dossier e2e/)
pnpm run test:e2e:ui          # Playwright en mode interface
pnpm run test:e2e:install     # Première fois : installation du navigateur Chromium pour Playwright
```

### Prérequis des tests

- **Tous** : Node comme pour le développement.
- **Intégration** : instance **PostgreSQL** accessible, schéma à jour (`pnpm run db:migrate` ou `db:push` sur la base de test).
- **E2e** : même nécessité de base si vous utilisez une base dédiée ; **compte utilisateur** présent dans cette base (email / mot de passe alignés sur les variables ci‑dessous). Installer Chromium une fois via `test:e2e:install`.

### Variables d’environnement pour les tests

Les clés utiles :

- **`DATABASE_URL_TEST`** — Base PostgreSQL pour les **tests d’intégration**. Si elle est définie, Playwright l’injecte dans **`DATABASE_URL`** pour le **serveur Next** lancé pendant les e2e, afin d’éviter d’écrire dans la base de **développement** du `.env`.
- **`E2E_USER_EMAIL`**, **`E2E_USER_PASSWORD`** — Compte existant en base pour les e2e. L’utilisateur doit exister dans la base ciblée par `DATABASE_URL_TEST` lorsque vous l’utilisez.
- **`PLAYWRIGHT_BASE_URL`** — URL de l’application pour Playwright (défaut `http://localhost:3000`). À aligner sur **`NEXT_PUBLIC_APP_URL`** (cookies, Better Auth).

## Structure du dépôt

- `src/app/` — routes App Router, layouts, pages et routes API (`api/…`).
- `src/features/` — regroupement par domaine (jeu, grilles, composants liés).
- `src/components/` — composants partagés (en-tête, pied de page, auth, UI).
- `src/db/` — schéma Drizzle, client DB et relations.
- `src/lib/` — auth Better Auth, utilitaires, client API grilles, métadonnées du site.
- `drizzle/` — migrations SQL générées par Drizzle Kit.

## Scripts npm (base de données)

| Script                  | Description                                                                          |
| ----------------------- | ------------------------------------------------------------------------------------ |
| `npm run db:generate`   | Génère des fichiers de migration à partir de `src/db/schema.ts`.                     |
| `npm run db:introspect` | Introspection du schéma depuis la base existante (Drizzle Kit).                      |
| `npm run db:migrate`    | Applique les migrations SQL sur `DATABASE_URL`.                                      |
| `npm run db:push`       | Pousse le schéma vers la base sans passer par des fichiers de migration (usage dev). |
| `npm run db:studio`     | Ouvre Drizzle Studio pour explorer les données.                                      |
