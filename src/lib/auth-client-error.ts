export const AUTH_RATE_LIMIT_USER_MESSAGE =
  "Trop de tentatives. Réessayez dans quelques instants.";

type AuthClientError = {
  status?: number;
  statusCode?: number;
  message?: string;
};

export function resolveAuthFormError(
  error: AuthClientError | null | undefined,
  fallback: string,
): string {
  if (!error) return fallback;
  const status = error.status ?? error.statusCode;
  if (status === 429) return AUTH_RATE_LIMIT_USER_MESSAGE;
  const msg = error.message?.trim();
  if (msg && /too many requests/i.test(msg)) {
    return AUTH_RATE_LIMIT_USER_MESSAGE;
  }
  return msg || fallback;
}
