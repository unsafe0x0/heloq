import { createHmac } from "crypto";

/**
 * Creates HMAC-SHA512 signature for the given data
 * Returns base64url encoded signature (URL-safe, no padding)
 */
export function sign(data: string, secret: string): string {
  return createHmac("sha512", secret)
    .update(data)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/**
 * Verifies signature by comparing with freshly computed signature
 * Uses constant-time comparison via string equality
 */
export function verify(
  data: string,
  signature: string,
  secret: string,
): boolean {
  const expectedSignature = sign(data, secret);
  return expectedSignature === signature;
}
