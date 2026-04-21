/*
 * Pagination et curseurs pour l'affichage des grilles.
 */

export type GridsListSortMode = "recent" | "popular";

export type GridsCursorRecent = { v: 1; sort: "recent"; u: string; i: string };
export type GridsCursorPopular = {
  v: 1;
  sort: "popular";
  l: number;
  u: string;
  i: string;
};
export type GridsCursorPayload = GridsCursorRecent | GridsCursorPopular;

export const GRIDS_PAGE_DEFAULT_LIMIT = 10;
export const GRIDS_PAGE_MAX_LIMIT = 50;

const GRIDS_CURSOR_B64_MAX_LENGTH = 2048;
const GRIDS_CURSOR_KEYS_RECENT = ["i", "sort", "u", "v"] as const;
const GRIDS_CURSOR_KEYS_POPULAR = ["i", "l", "sort", "u", "v"] as const;
const PG_INT_MAX = 2_147_483_647;

export type ParseGridsCursorResult =
  | { ok: true; value: GridsCursorPayload | null }
  | { ok: false; reason: "sort_mismatch" | "invalid" };

/*
 * Vérifie que `obj` a exactement les clés attendues (ni en trop ni en manquante).
 * Sert à rejeter un curseur JSON bidon ou altéré avant usage SQL.
 */
function hasExactKeySet(obj: object, expected: readonly string[]): boolean {
  const keys = Object.keys(obj);
  if (keys.length !== expected.length) return false;
  const set = new Set(keys);
  return expected.every((k) => set.has(k));
}

/*
 * Vérifie que la chaîne ressemble à un UUID (RFC 4122 : variantes 1–5, version dans le 3e groupe).
 * Utilisé pour le champ `i` (id de grille) du curseur avant de le passer en requête SQL.
 */
function isUuidLike(s: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    s,
  );
}

/*
 * Sérialise le curseur de pagination en une chaîne base64url pour le paramètre `cursor` de l’URL.
 * Le client renvoie cette valeur telle quelle pour charger la page suivante.
 */
export function encodeGridsCursor(payload: GridsCursorPayload): string {
  return Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
}

/*
 * Décode et valide `?cursor=` (base64url → JSON) pour la liste paginée.
 * Retourne `null` si absent (première page), un payload typé si valide, ou une erreur
 * (`invalid` / `sort_mismatch` si le tri du curseur ne correspond pas à `expectedSort`).
 */
export function parseGridsListCursor(
  raw: unknown,
  expectedSort: GridsListSortMode,
): ParseGridsCursorResult {
  // Même convention que côté query multi-valeurs : ne garder que le premier élément.
  const s = Array.isArray(raw) ? raw[0] : raw;
  // Pas de curseur : on commence en tête de liste.
  if (s === undefined || s === null || s === "") {
    return { ok: true, value: null };
  }
  if (typeof s !== "string") {
    return { ok: false, reason: "invalid" };
  }
  // Limite la taille décodable (évite payloads énormes).
  if (s.length > GRIDS_CURSOR_B64_MAX_LENGTH) {
    return { ok: false, reason: "invalid" };
  }
  let parsed: unknown;
  try {
    const json = Buffer.from(s, "base64url").toString("utf8");
    parsed = JSON.parse(json) as unknown;
  } catch {
    return { ok: false, reason: "invalid" };
  }
  if (typeof parsed !== "object" || parsed === null) {
    return { ok: false, reason: "invalid" };
  }
  // Refuse les instances (tableau, Date, etc.) : uniquement un objet « plain ».
  if (Object.getPrototypeOf(parsed) !== Object.prototype) {
    return { ok: false, reason: "invalid" };
  }
  const p = parsed as {
    v?: unknown;
    sort?: unknown;
    u?: unknown;
    i?: unknown;
    l?: unknown;
  };
  // Version du schéma curseur ; seule la v1 est supportée.
  if (p.v !== 1) {
    return { ok: false, reason: "invalid" };
  }
  if (p.sort !== "recent" && p.sort !== "popular") {
    return { ok: false, reason: "invalid" };
  }
  // Le client ne doit pas réutiliser un curseur « popular » quand l’API demande « recent », et inversement.
  if (p.sort !== expectedSort) {
    return { ok: false, reason: "sort_mismatch" };
  }
  if (p.sort === "recent") {
    // Clé de tri : `createdAt` (`u`) puis id grille (`i`).
    if (!hasExactKeySet(parsed, GRIDS_CURSOR_KEYS_RECENT)) {
      return { ok: false, reason: "invalid" };
    }
    if (typeof p.u !== "string" || typeof p.i !== "string") {
      return { ok: false, reason: "invalid" };
    }
    if (Number.isNaN(Date.parse(p.u))) {
      return { ok: false, reason: "invalid" };
    }
    if (!isUuidLike(p.i)) {
      return { ok: false, reason: "invalid" };
    }
    return { ok: true, value: { v: 1, sort: "recent", u: p.u, i: p.i } };
  }
  // Branche « popular » : clé = nombre de likes (`l`), puis `u`, puis `i`.
  if (!hasExactKeySet(parsed, GRIDS_CURSOR_KEYS_POPULAR)) {
    return { ok: false, reason: "invalid" };
  }
  if (
    typeof p.l !== "number" ||
    !Number.isInteger(p.l) ||
    p.l < 0 ||
    p.l > PG_INT_MAX
  ) {
    return { ok: false, reason: "invalid" };
  }
  if (typeof p.u !== "string" || typeof p.i !== "string") {
    return { ok: false, reason: "invalid" };
  }
  if (Number.isNaN(Date.parse(p.u))) {
    return { ok: false, reason: "invalid" };
  }
  if (!isUuidLike(p.i)) {
    return { ok: false, reason: "invalid" };
  }
  return {
    ok: true,
    value: { v: 1, sort: "popular", l: p.l, u: p.u, i: p.i },
  };
}

/*
 * Lit la taille de page depuis la query (`limit`) : entier ≥ 1, plafonné à {@link GRIDS_PAGE_MAX_LIMIT}.
 * Valeur invalide ou absente → {@link GRIDS_PAGE_DEFAULT_LIMIT} (comportement tolérant, comme l’API Express).
 */
export function parseGridsPageLimit(raw: unknown): number {
  const n = Array.isArray(raw) ? raw[0] : raw;
  const v =
    typeof n === "string" ? parseInt(n, 10) : typeof n === "number" ? n : NaN;
  // NaN, 0, négatif : repli sur la page par défaut.
  if (!Number.isFinite(v) || v < 1) return GRIDS_PAGE_DEFAULT_LIMIT;
  // Arrondi inférieur + plafond (évite les pages trop lourdes).
  return Math.min(Math.floor(v), GRIDS_PAGE_MAX_LIMIT);
}

function createdAtToIso(value: string | Date): string {
  return typeof value === "string" ? value : value.toISOString();
}

/*
 * Construit le curseur « page suivante » pour un tri par date de création (clé : `createdAt`, puis `id`).
 */
export function cursorFromRowRecent(row: {
  createdAt: string | Date;
  id: string;
}): string {
  return encodeGridsCursor({
    v: 1,
    sort: "recent",
    u: createdAtToIso(row.createdAt),
    i: row.id,
  });
}

/*
 * Construit le curseur « page suivante » pour un tri par popularité (clé : nombre de likes, `createdAt`, `id`).
 */
export function cursorFromRowPopular(row: {
  likeCount: number;
  createdAt: string | Date;
  id: string;
}): string {
  return encodeGridsCursor({
    v: 1,
    sort: "popular",
    l: row.likeCount,
    u: createdAtToIso(row.createdAt),
    i: row.id,
  });
}
