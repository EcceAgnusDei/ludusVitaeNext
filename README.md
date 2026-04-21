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
