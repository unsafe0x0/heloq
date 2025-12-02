import { encode } from "../utils/base64url";
import { sign } from "../utils/crypto";
import { now, expiration } from "../utils/time";
import type { CreateOptions, TokenPayload } from "../types/types";

// Default token expiry: 1 hour in seconds
const DEFAULT_EXPIRY = 3600;

/**
 * Creates a signed token with the given payload and secret.
 * Uses HMAC-SHA512 for signing.
 */
export function createToken<T extends Record<string, unknown>>(
  payload: T,
  secret: string,
  options: CreateOptions = {},
): string {
  if (!secret || secret.length < 32) {
    throw new Error("Secret must be at least 32 characters");
  }

  // Token header with algorithm and type
  const header = {
    alg: "HS512",
    typ: "HLQ",
  };

  const iat = now();
  const exp = expiration(iat, options.expiresIn ?? DEFAULT_EXPIRY);

  // Merge user payload with token metadata
  const fullPayload: TokenPayload = {
    ...payload,
    iat,
    exp,
  };

  // Encode header and payload as base64url
  const h = encode(header);
  const p = encode(fullPayload);

  // Sign the encoded header.payload string
  const signature = sign(`${h}.${p}`, secret);

  return `${h}.${p}.${signature}`;
}
