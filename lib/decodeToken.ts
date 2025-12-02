import { decode } from "../utils/base64url";
import type { TokenPayload } from "../types/types";

/**
 * Decodes a token without verifying its signature.
 * Useful for reading payload data when verification is not needed.
 * WARNING: Do not trust decoded data without verification.
 */
export function decodeToken(token: string): TokenPayload {
  if (!token || typeof token !== "string") {
    throw new Error("Token must be a non-empty string");
  }

  const parts = token.split(".");

  if (parts.length !== 3) {
    throw new Error("Invalid token format: expected 3 parts");
  }

  try {
    const payload = JSON.parse(decode(String(parts[1])));
    return payload;
  } catch {
    throw new Error("Invalid token: failed to decode payload");
  }
}
