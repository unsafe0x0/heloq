# heloq

A minimal, fast, type-safe token library with HMAC-SHA512 signing.

## Installation

```bash
# Using bun
bun add heloq

# Using npm
npm install heloq
```

## Quick Start

```typescript
import { createToken, verifyToken, decodeToken } from "heloq";

const SECRET = "your-secret-key-at-least-32-characters-long";

// Create a token
const token = createToken(
  { userId: 123, role: "admin" },
  SECRET,
  { expiresIn: 3600 }, // 1 hour
);

// Verify and decode a token
try {
  const payload = verifyToken(token, SECRET);
  console.log(payload.userId); // 123
} catch (error) {
  console.error("Invalid or expired token");
}

// Decode without verification (use with caution)
const decoded = decodeToken(token);
```

## API

### `createToken(payload, secret, options?)`

Creates a signed token.

| Parameter           | Type     | Description                                |
| ------------------- | -------- | ------------------------------------------ |
| `payload`           | `object` | Data to encode in the token                |
| `secret`            | `string` | Secret key (minimum 32 characters)         |
| `options.expiresIn` | `number` | Expiration time in seconds (default: 3600) |

**Returns:** `string` - The signed token

```typescript
const token = createToken(
  { userId: 1, email: "user@example.com" },
  SECRET,
  { expiresIn: 7200 }, // 2 hours
);
```

### `verifyToken(token, secret)`

Verifies a token's signature and checks expiration.

| Parameter | Type     | Description                       |
| --------- | -------- | --------------------------------- |
| `token`   | `string` | Token to verify                   |
| `secret`  | `string` | Secret key used to sign the token |

**Returns:** `TokenPayload` - Decoded payload with `iat` and `exp` fields

**Throws:**

- `"Token must be a non-empty string"` - Empty token
- `"Secret must be a non-empty string"` - Empty secret
- `"Invalid token format"` - Malformed token
- `"Invalid signature"` - Signature verification failed
- `"Token expired"` - Token has expired

```typescript
try {
  const payload = verifyToken(token, SECRET);
  console.log(payload);
} catch (error) {
  // Handle error
}
```

### `decodeToken(token)`

Decodes a token without verifying the signature.

> ⚠️ **Warning:** Only use this for reading non-sensitive data. Always use `verifyToken` for authentication.

| Parameter | Type     | Description     |
| --------- | -------- | --------------- |
| `token`   | `string` | Token to decode |

**Returns:** `TokenPayload` - Decoded payload

```typescript
const payload = decodeToken(token);
console.log(payload.userId);
```

## Types

```typescript
interface CreateOptions {
  expiresIn?: number; // Expiration in seconds (default: 3600)
}

interface TokenPayload {
  [key: string]: unknown;
  iat: number; // Issued at (Unix timestamp)
  exp: number; // Expires at (Unix timestamp)
}
```

## Token Format

Tokens follow a JWT-like structure with three base64url-encoded parts:

```
header.payload.signature
```

- **Header:** Contains algorithm (`HS512`) and type (`HLQ`)
- **Payload:** Your data plus `iat` and `exp` timestamps
- **Signature:** HMAC-SHA512 signature of `header.payload`

## Security

- Uses HMAC-SHA512 for signing
- Requires secrets of at least 32 characters
- Tokens include expiration by default (1 hour)
- Always verify tokens before trusting their contents

## Development

```bash
# Install dependencies
bun install

# Run tests
bun test

# Type check
bun run build
```

## License

MIT
