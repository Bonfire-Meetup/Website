"use client";

interface CheckInTokenPayload {
  sub: string;
  iat: number;
  exp: number;
  v: string;
}

interface VerifyTokenResult {
  valid: boolean;
  userId?: string;
  error?: string;
}

export function parseCheckInToken(token: string): VerifyTokenResult {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) {
      return { valid: false, error: "Invalid token format" };
    }

    const [version, encodedPayload, _signature] = parts;

    if (version !== "v1") {
      return { valid: false, error: "Unsupported token version" };
    }

    let base64 = encodedPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }
    const decodedPayload = JSON.parse(atob(base64)) as CheckInTokenPayload;

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (decodedPayload.exp < nowSeconds) {
      return { valid: false, error: "Token expired" };
    }

    return {
      valid: true,
      userId: decodedPayload.sub,
    };
  } catch {
    return { valid: false, error: "Failed to parse token" };
  }
}

export function extractTokenFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const { hash } = urlObj;
    if (!hash) {
      return null;
    }

    const params = new URLSearchParams(hash.substring(1));
    return params.get("check-in");
  } catch {
    return null;
  }
}
