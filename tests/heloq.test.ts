import { describe, test, expect } from "bun:test";
import { createToken, verifyToken, decodeToken } from "../index";

const SECRET = "this-is-a-very-secure-secret-key-for-testing";

describe("createToken", () => {
  test("creates a valid token with 3 parts", () => {
    const payload = { userId: 123, role: "admin" };
    const token = createToken(payload, SECRET);
    const parts = token.split(".");

    expect(parts.length).toBe(3);
    expect(token).toBeTypeOf("string");
  });

  test("throws error if secret is too short", () => {
    const payload = { userId: 123 };
    expect(() => createToken(payload, "short")).toThrow(
      "Secret must be at least 32 characters",
    );
  });

  test("includes payload data in token", () => {
    const payload = { userId: 456, name: "John" };
    const token = createToken(payload, SECRET);
    const decoded = decodeToken(token);

    expect(decoded.userId).toBe(456);
    expect(decoded.name).toBe("John");
  });

  test("adds iat and exp to payload", () => {
    const payload = { userId: 789 };
    const token = createToken(payload, SECRET);
    const decoded = decodeToken(token);

    expect(decoded.iat).toBeTypeOf("number");
    expect(decoded.exp).toBeTypeOf("number");
    expect(decoded.exp).toBeGreaterThan(decoded.iat);
  });

  test("respects custom expiresIn option", () => {
    const payload = { userId: 1 };
    const token = createToken(payload, SECRET, { expiresIn: 60 });
    const decoded = decodeToken(token);

    expect(decoded.exp - decoded.iat).toBe(60);
  });

  test("uses default expiry of 1 hour when not specified", () => {
    const payload = { userId: 1 };
    const token = createToken(payload, SECRET);
    const decoded = decodeToken(token);

    expect(decoded.exp - decoded.iat).toBe(3600);
  });
});

describe("verifyToken", () => {
  test("verifies a valid token and returns payload", () => {
    const payload = { userId: 123, role: "user" };
    const token = createToken(payload, SECRET);
    const verified = verifyToken(token, SECRET);

    expect(verified.userId).toBe(123);
    expect(verified.role).toBe("user");
  });

  test("throws error for invalid token format", () => {
    expect(() => verifyToken("invalid", SECRET)).toThrow(
      "Invalid token format",
    );
    expect(() => verifyToken("only.two", SECRET)).toThrow(
      "Invalid token format",
    );
  });

  test("throws error for empty token", () => {
    expect(() => verifyToken("", SECRET)).toThrow(
      "Token must be a non-empty string",
    );
  });

  test("throws error for empty secret", () => {
    const token = createToken({ userId: 1 }, SECRET);
    expect(() => verifyToken(token, "")).toThrow(
      "Secret must be a non-empty string",
    );
  });

  test("throws error for invalid signature", () => {
    const token = createToken({ userId: 1 }, SECRET);
    const wrongSecret = "another-very-secure-secret-key-for-testing";

    expect(() => verifyToken(token, wrongSecret)).toThrow("Invalid signature");
  });

  test("throws error for tampered payload", () => {
    const token = createToken({ userId: 1 }, SECRET);
    const parts = token.split(".");
    // Tamper with payload
    parts[1] = Buffer.from(
      '{"userId":999,"iat":9999999999,"exp":9999999999}',
    ).toString("base64url");
    const tamperedToken = parts.join(".");

    expect(() => verifyToken(tamperedToken, SECRET)).toThrow(
      "Invalid signature",
    );
  });

  test("throws error for expired token", () => {
    const payload = { userId: 1 };
    // Create token that expires in -1 second (already expired)
    const token = createToken(payload, SECRET, { expiresIn: -1 });

    expect(() => verifyToken(token, SECRET)).toThrow("Token expired");
  });
});

describe("decodeToken", () => {
  test("decodes token payload without verification", () => {
    const payload = { userId: 100, data: "test" };
    const token = createToken(payload, SECRET);
    const decoded = decodeToken(token);

    expect(decoded.userId).toBe(100);
    expect(decoded.data).toBe("test");
  });

  test("throws error for invalid token format", () => {
    expect(() => decodeToken("invalid")).toThrow("Invalid token format");
    expect(() => decodeToken("a.b")).toThrow("Invalid token format");
  });

  test("throws error for empty token", () => {
    expect(() => decodeToken("")).toThrow("Token must be a non-empty string");
  });

  test("throws error for invalid base64 payload", () => {
    expect(() => decodeToken("a.!!!.c")).toThrow("Invalid token");
  });
});

describe("integration", () => {
  test("full token lifecycle: create, decode, verify", () => {
    const originalPayload = {
      userId: 42,
      email: "test@example.com",
      permissions: ["read", "write"],
    };

    // Create token
    const token = createToken(originalPayload, SECRET, { expiresIn: 7200 });
    expect(token).toBeTypeOf("string");

    // Decode without verification
    const decoded = decodeToken(token);
    expect(decoded.userId).toBe(42);
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.permissions).toEqual(["read", "write"]);

    // Verify with correct secret
    const verified = verifyToken(token, SECRET);
    expect(verified.userId).toBe(42);
    expect(verified.exp - verified.iat).toBe(7200);
  });

  test("tokens with same payload but different secrets are different", () => {
    const payload = { userId: 1 };
    const secret1 = "first-very-secure-secret-key-for-testing!";
    const secret2 = "second-very-secure-secret-key-for-test!";

    const token1 = createToken(payload, secret1);
    const token2 = createToken(payload, secret2);

    expect(token1).not.toBe(token2);
  });

  test("handles complex nested payload", () => {
    const payload = {
      user: {
        id: 1,
        profile: {
          name: "Test User",
          settings: { theme: "dark" },
        },
      },
      metadata: [1, 2, 3],
    };

    const token = createToken(payload, SECRET);
    const decoded = decodeToken(token);

    expect(decoded.user).toEqual(payload.user);
    expect(decoded.metadata).toEqual([1, 2, 3]);
  });
});
