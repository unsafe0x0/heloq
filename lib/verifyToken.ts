import { decode } from "../utils/base64url";
import { verify } from "../utils/crypto";
import { now } from "../utils/time";
import type { TokenPayload } from "../types/types";

/**
 * Verifies a token's signature and expiration, returns the decoded payload.
 * Throws if token is malformed, signature is invalid, or token is expired.
 */
export function verifyToken(token: string, secret: string): TokenPayload {
  // Validate inputs
  if (!token || typeof token !== "string") {
    throw new Error("Token must be a non-empty string");
  }
  if (!secret || typeof secret !== "string") {
    throw new Error("Secret must be a non-empty string");
  }

  // Token must have exactly 3 parts: header.payload.signature
  const parts = token.split(".");
  if (parts.length !== 3) {
    throw new Error("Invalid token format");
  }

  const [header, payload, signature] = parts;

  // Verify HMAC signature against header.payload
  const isValid = verify(`${header}.${payload}`, String(signature), secret);
  if (!isValid) {
    throw new Error("Invalid signature");
  }

  // Decode and parse the payload
  const decoded: TokenPayload = JSON.parse(decode(String(payload)));

  // Check token expiration
  if (typeof decoded.exp === "number" && decoded.exp < now()) {
    throw new Error("Token expired");
  }

  return decoded;
}
