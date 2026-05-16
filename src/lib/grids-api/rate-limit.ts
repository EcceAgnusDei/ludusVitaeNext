import { eq } from "drizzle-orm";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

import { getDb } from "@/db";
import { rateLimit } from "@/db/schema";

export const GRIDS_RATE_LIMIT_MESSAGE =
  "Trop de requêtes. Réessayez dans quelques instants.";

const GRIDS_CREATE_WINDOW_SEC = 60 * 60;
const GRIDS_CREATE_MAX_PER_USER = 30;
const GRIDS_CREATE_MAX_PER_IP = 50;

const GRIDS_LIKE_WINDOW_SEC = 60;
const GRIDS_LIKE_MAX_PER_USER = 90;

function isRateLimitEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.API_RATE_LIMIT_ENABLED === "true"
  );
}

export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return first;
  }
  const realIp = h.get("x-real-ip")?.trim();
  return realIp && realIp.length > 0 ? realIp : null;
}

type ConsumeResult = { ok: true } | { ok: false; retryAfterSec: number };

async function consumeRateLimit(
  key: string,
  windowSec: number,
  max: number,
): Promise<ConsumeResult> {
  const db = getDb();
  const now = Date.now();
  const windowMs = windowSec * 1000;

  const rows = await db
    .select()
    .from(rateLimit)
    .where(eq(rateLimit.key, key))
    .limit(1);
  const row = rows[0];

  if (!row) {
    await db.insert(rateLimit).values({ key, count: 1, lastRequest: now });
    return { ok: true };
  }

  if (now - row.lastRequest >= windowMs) {
    await db
      .update(rateLimit)
      .set({ count: 1, lastRequest: now })
      .where(eq(rateLimit.key, key));
    return { ok: true };
  }

  if (row.count >= max) {
    const retryAfterSec = Math.ceil(
      (row.lastRequest + windowMs - now) / 1000,
    );
    return { ok: false, retryAfterSec: Math.max(1, retryAfterSec) };
  }

  await db
    .update(rateLimit)
    .set({ count: row.count + 1, lastRequest: now })
    .where(eq(rateLimit.key, key));
  return { ok: true };
}

async function enforceRules(
  rules: { key: string; windowSec: number; max: number }[],
): Promise<NextResponse | null> {
  if (!isRateLimitEnabled()) return null;

  for (const rule of rules) {
    const result = await consumeRateLimit(rule.key, rule.windowSec, rule.max);
    if (!result.ok) {
      return NextResponse.json(
        { error: GRIDS_RATE_LIMIT_MESSAGE },
        {
          status: 429,
          headers: { "X-Retry-After": String(result.retryAfterSec) },
        },
      );
    }
  }
  return null;
}

export async function enforceGridCreateRateLimit(
  userId: string,
): Promise<NextResponse | null> {
  const rules: { key: string; windowSec: number; max: number }[] = [
    {
      key: `lv:grids:create:user:${userId}`,
      windowSec: GRIDS_CREATE_WINDOW_SEC,
      max: GRIDS_CREATE_MAX_PER_USER,
    },
  ];
  const ip = await getClientIp();
  if (ip) {
    rules.push({
      key: `lv:grids:create:ip:${ip}`,
      windowSec: GRIDS_CREATE_WINDOW_SEC,
      max: GRIDS_CREATE_MAX_PER_IP,
    });
  }
  return enforceRules(rules);
}

export async function enforceGridLikeRateLimit(
  userId: string,
): Promise<NextResponse | null> {
  return enforceRules([
    {
      key: `lv:grids:like:user:${userId}`,
      windowSec: GRIDS_LIKE_WINDOW_SEC,
      max: GRIDS_LIKE_MAX_PER_USER,
    },
  ]);
}
