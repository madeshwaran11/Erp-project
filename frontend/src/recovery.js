/**
 * Account recovery route and token helpers.
 *
 * Kept free of React so the routing contract can be unit tested directly.
 */
export const FORGOT_PASSWORD_PATH = "/forgot-password";
export const RESET_PASSWORD_PATH = "/reset-password";

/**
 * Reads the single-use token from a URLSearchParams instance or a raw query
 * string. Returns an empty string when the link has no token.
 */
export function readResetToken(source) {
  const params =
    source instanceof URLSearchParams
      ? source
      : new URLSearchParams(source || "");

  return params.get("token") || "";
}

/**
 * Builds the in-app reset route for a raw token. The token is encoded so
 * URL-safe base64 and any padding survive the mail client.
 */
export function buildResetPath(token) {
  const value = typeof token === "string" ? token : "";

  return value
    ? `${RESET_PASSWORD_PATH}?token=${encodeURIComponent(value)}`
    : RESET_PASSWORD_PATH;
}
