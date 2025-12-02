// Default token expiration: 1 hour in seconds
const DEFAULT_EXPIRY = 3600;

// Returns current Unix timestamp in seconds
export function now(): number {
  return Math.floor(Date.now() / 1000);
}

// Calculates expiration timestamp from issued-at time
// Uses default expiry if seconds is not provided (undefined)
// Allows negative values for testing expired tokens
export function expiration(iat: number, seconds?: number): number {
  if (seconds === undefined) {
    return iat + DEFAULT_EXPIRY;
  }
  return iat + seconds;
}
