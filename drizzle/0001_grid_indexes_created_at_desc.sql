-- Tri sur
-- `createdAt` en DESC. Le SQL généré pour `0000_initial` omettait ce DESC sur la 2e colonne.
DROP INDEX IF EXISTS "grid_isPublic_createdAt_idx";--> statement-breakpoint
CREATE INDEX "grid_isPublic_createdAt_idx" ON "grid" ("isPublic", "createdAt" DESC);--> statement-breakpoint
DROP INDEX IF EXISTS "grid_userId_createdAt_idx";--> statement-breakpoint
CREATE INDEX "grid_userId_createdAt_idx" ON "grid" ("userId", "createdAt" DESC);
