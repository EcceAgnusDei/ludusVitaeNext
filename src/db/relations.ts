/*
 * Graphe Drizzle : chaque `foreignKey` de schema.ts doit apparaître ici en
 * `one` / `many` (fields = colonnes FK sur la table courante, references = PK cible).
 *
 * | Table (FK)           | Contrainte SQL                  | Relation déclarée |
 * |----------------------|---------------------------------|-------------------|
 * | session              | session_userId_fkey             | sessionRelations.user |
 * | password_reset_token | password_reset_token_userId_fkey| passwordResetTokenRelations.user |
 * | account              | account_userId_fkey             | accountRelations.user |
 * | grid                 | grid_userId_fkey                | gridRelations.user |
 * | grid_like            | grid_like_gridId_fkey           | gridLikeRelations.grid |
 * | grid_like            | grid_like_userId_fkey           | gridLikeRelations.user |
 *
 * Tables sans FK sortante : `user`, `verification` — pas de `one()` sortant ;
 * `userRelations` agrège les `many()` inverses des FK ci-dessus (sauf grid_like → grid,
 * couvert par gridRelations.gridLikes).
 */
import { relations } from "drizzle-orm/relations";
import {
  account,
  grid,
  gridLike,
  passwordResetToken,
  session,
  user,
} from "./schema";

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  passwordResetTokens: many(passwordResetToken),
  accounts: many(account),
  grids: many(grid),
  gridLikes: many(gridLike),
}));

export const passwordResetTokenRelations = relations(
  passwordResetToken,
  ({ one }) => ({
    user: one(user, {
      fields: [passwordResetToken.userId],
      references: [user.id],
    }),
  }),
);

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const gridRelations = relations(grid, ({ one, many }) => ({
  user: one(user, {
    fields: [grid.userId],
    references: [user.id],
  }),
  gridLikes: many(gridLike),
}));

export const gridLikeRelations = relations(gridLike, ({ one }) => ({
  grid: one(grid, {
    fields: [gridLike.gridId],
    references: [grid.id],
  }),
  user: one(user, {
    fields: [gridLike.userId],
    references: [user.id],
  }),
}));
