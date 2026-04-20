import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { i18n } from "@better-auth/i18n";
import { nextCookies } from "better-auth/next-js";
import { betterAuthFrMessages } from "@/lib/better-auth-fr-translations";
import { sql } from "drizzle-orm";
import { account, session, user, verification } from "@/db/schema";
import { getDb } from "@/db";

/** Unicité du nom affiché à l’inscription uniquement (pas de changement de nom côté app). */
async function assertUniqueUserName(trimmedName: string): Promise<void> {
  if (!trimmedName) return;
  const db = getDb();
  const sameName = sql`LOWER(TRIM(${user.name})) = LOWER(${trimmedName})`;
  const rows = await db
    .select({ id: user.id })
    .from(user)
    .where(sameName)
    .limit(1);
  if (rows.length > 0) {
    throw new APIError("BAD_REQUEST", {
      message: "Ce nom d'utilisateur est déjà utilisé.",
    });
  }
}

function resolveBaseURL(): string {
  return (
    process.env.BETTER_AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    "http://localhost:3000"
  );
}

function resolveSecret(): string {
  const s = process.env.BETTER_AUTH_SECRET;
  if (!s) {
    throw new Error(
      "BETTER_AUTH_SECRET is required (dev, build, and production — set it in .env or CI).",
    );
  }
  return s;
}

const trustedOrigins = (): string[] => {
  const base = resolveBaseURL();
  const extra = process.env.BETTER_AUTH_TRUSTED_ORIGINS;
  const fromEnv = extra
    ? extra
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean)
    : [];
  return Array.from(new Set([base, ...fromEnv]));
};

export const auth = betterAuth({
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    schema: { user, session, account, verification },
    camelCase: true,
  }),
  baseURL: resolveBaseURL(),
  secret: resolveSecret(),
  trustedOrigins: trustedOrigins(),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
    requireEmailVerification: false,
  },
  user: {
    deleteUser: {
      enabled: true,
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (u) => {
          const name = typeof u.name === "string" ? u.name.trim() : "";
          if (!name) return { data: u };
          await assertUniqueUserName(name);
          return { data: { ...u, name } };
        },
      },
      update: {
        before: async (partial) => {
          // Bloque POST /api/auth/.../update-user (et tout autre flux) si un nouveau nom est fourni (changement de nom interdit)
          // `name: undefined` reste possible (ex. mise à jour de l’image seule).
          if (partial.name != null) {
            throw new APIError("FORBIDDEN", {
              message: "Le nom d'utilisateur ne peut pas être modifié.",
            });
          }
          return { data: partial };
        },
      },
    },
  },
  plugins: [
    nextCookies(),
    i18n({
      defaultLocale: "fr",
      detection: ["header", "cookie"],
      translations: {
        fr: betterAuthFrMessages,
        /** Laisse les messages anglais d’origine pour les navigateurs en `en`. */
        en: {},
      },
    }),
  ],
});
