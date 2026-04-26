/*
 * Validation et parsing des entrées HTTP (query / JSON) pour les grilles.
 */

import { z } from "zod";

import {
  parseGridsListCursor,
  parseGridsPageLimit,
  type GridsCursorPayload,
  type GridsListSortMode,
} from "@/lib/grids-api/cursor";

// =============================================================================
// Validation — schémas Zod et règles sur la forme des données
// =============================================================================

const gridsSortSchema = z.enum(["recent", "popular"], {
  message: "Paramètre sort requis : recent ou popular",
});

const createGridBodySchema = z
  .object({
    name: z.union([z.string(), z.null()]).optional(),
    data: z.unknown().optional(),
    isPublic: z.boolean().optional(),
  })
  .superRefine((body, ctx) => {
    if (
      body.data !== undefined &&
      (body.data === null || typeof body.data !== "object")
    ) {
      ctx.addIssue({
        code: "custom",
        message: "data doit être un objet",
      });
    }
  });

const patchGridBodySchema = z.object({
  isPublic: z.boolean({ message: "isPublic (booléen) est requis" }),
});

export type CreateGridBody = z.infer<typeof createGridBodySchema>;
export type PatchGridBody = z.infer<typeof patchGridBodySchema>;

function zodIssuesToSingleMessage(error: z.ZodError): string {
  const first = error.issues[0];
  if (!first) return "Requête invalide.";
  return typeof first.message === "string"
    ? first.message
    : "Requête invalide.";
}

// =============================================================================
// Parsing — lecture des entrées HTTP (query / JSON) → valeur typée ou erreur
// =============================================================================

export type ParsedGridsListQuery = {
  sort: GridsListSortMode;
  cursor: GridsCursorPayload | null;
  limit: number;
};

export type ParseJsonError = { ok: false; error: string };

export function firstQueryValue(
  searchParams: URLSearchParams,
  key: string,
): string | undefined {
  const v = searchParams.get(key);
  if (v === null || v === "") return undefined;
  return v;
}

/*
 * Query `GET /api/grids/all` : `sort` obligatoire, `cursor` et `limit` optionnels.
 */
export function parseGridsAllQuery(
  searchParams: URLSearchParams,
):
  | { ok: true; value: ParsedGridsListQuery }
  | { ok: false; error: string; status: 400 } {
  const sortRaw = firstQueryValue(searchParams, "sort");
  const sortParsed = gridsSortSchema.safeParse(sortRaw);
  if (!sortParsed.success) {
    return {
      ok: false,
      error: zodIssuesToSingleMessage(sortParsed.error),
      status: 400,
    };
  }
  const sort = sortParsed.data;

  const cursorRaw = firstQueryValue(searchParams, "cursor");
  const parsedCursor = parseGridsListCursor(cursorRaw ?? null, sort);
  if (!parsedCursor.ok) {
    return {
      ok: false,
      error:
        parsedCursor.reason === "sort_mismatch"
          ? "Ce curseur ne correspond pas au tri (sort) demandé."
          : "Curseur de pagination invalide.",
      status: 400,
    };
  }

  const limitRaw = firstQueryValue(searchParams, "limit");
  const limit = parseGridsPageLimit(
    limitRaw === undefined ? undefined : limitRaw,
  );

  return {
    ok: true,
    value: {
      sort,
      cursor: parsedCursor.value,
      limit,
    },
  };
}

/*
 * Query `GET /api/grids/user/[userId]` : uniquement `sort`.
 */
export function parseGridsUserListQuery(
  searchParams: URLSearchParams,
):
  | { ok: true; value: { sort: GridsListSortMode } }
  | { ok: false; error: string; status: 400 } {
  const sortRaw = firstQueryValue(searchParams, "sort");
  const sortParsed = gridsSortSchema.safeParse(sortRaw);
  if (!sortParsed.success) {
    return {
      ok: false,
      error: zodIssuesToSingleMessage(sortParsed.error),
      status: 400,
    };
  }
  return { ok: true, value: { sort: sortParsed.data } };
}

/*
 * Corps `POST /api/grids` (création).
 */
export function parseCreateGridBody(
  json: unknown,
): { ok: true; value: CreateGridBody } | ParseJsonError {
  const parsed = createGridBodySchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: zodIssuesToSingleMessage(parsed.error) };
  }
  return { ok: true, value: parsed.data };
}

/*
 * Corps `PATCH /api/grids/[id]` pour la visibilité de la grille.
 */
export function parsePatchGridBody(
  json: unknown,
): { ok: true; value: PatchGridBody } | ParseJsonError {
  const parsed = patchGridBodySchema.safeParse(json);
  if (!parsed.success) {
    return { ok: false, error: zodIssuesToSingleMessage(parsed.error) };
  }
  return { ok: true, value: parsed.data };
}
