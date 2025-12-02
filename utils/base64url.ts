// Base64URL encoding/decoding utilities for JWT-style tokens

/**
 * Encodes data to base64url format (URL-safe base64 without padding)
 * @param data - Object or string to encode
 * @returns Base64URL encoded string
 */
export function encode(data: unknown): string {
  const json = typeof data === "string" ? data : JSON.stringify(data);
  // base64url encoding is already URL-safe, no manual replacements needed
  return Buffer.from(json).toString("base64url");
}

/**
 * Decodes a base64url encoded string back to its original form
 * @param str - Base64URL encoded string
 * @returns Decoded string
 */
export function decode(str: string): string {
  // Convert base64url to standard base64 for decoding
  const base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed (base64 requires length to be multiple of 4)
  const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);
  return Buffer.from(padded, "base64").toString("utf-8");
}
