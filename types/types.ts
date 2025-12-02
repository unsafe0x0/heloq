/**
 * Options for token creation
 */
export interface CreateOptions {
  /** Token expiration time in seconds (default: 3600 = 1 hour) */
  expiresIn?: number;
}

/**
 * Input payload provided by user (without iat/exp)
 */
export interface InputPayload {
  [key: string]: unknown;
}

/**
 * Complete token payload with timestamps
 */
export interface TokenPayload extends InputPayload {
  /** Issued at timestamp (seconds since Unix epoch) */
  iat: number;
  /** Expiration timestamp (seconds since Unix epoch) */
  exp: number;
}
