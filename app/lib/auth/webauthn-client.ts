"use client";

import {
  startAuthentication,
  startRegistration,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
} from "@simplewebauthn/browser";

import { API_ROUTES } from "@/lib/api/routes";

export const isWebAuthnSupported = (): boolean =>
  typeof window !== "undefined" &&
  typeof window.PublicKeyCredential !== "undefined" &&
  typeof window.PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable === "function";

export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

export const isConditionalMediationAvailable = async (): Promise<boolean> => {
  if (!isWebAuthnSupported()) {
    return false;
  }

  try {
    if (typeof PublicKeyCredential.isConditionalMediationAvailable !== "function") {
      return false;
    }
    return await PublicKeyCredential.isConditionalMediationAvailable();
  } catch {
    return false;
  }
};

export const derivePasskeyName = (authenticatorAttachment?: string): string => {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";

  const isIOS = /iPhone|iPad|iPod/.test(ua);
  const isMac = /Macintosh/.test(ua) && !isIOS;
  const isAndroid = /Android/.test(ua);
  const isWindows = /Windows/.test(ua);
  const isLinux = /Linux/.test(ua) && !isAndroid;
  const isChromeOS = /CrOS/.test(ua);

  if (authenticatorAttachment === "cross-platform") {
    return "Security Key";
  }

  if (isIOS) {
    return "iPhone";
  }

  if (isMac) {
    return "Mac";
  }

  if (isAndroid) {
    return "Android";
  }

  if (isWindows) {
    return "Windows";
  }

  if (isChromeOS) {
    return "Chromebook";
  }

  if (isLinux) {
    return "Linux";
  }

  return "Passkey";
};

export interface RegisterPasskeyResult {
  ok: boolean;
  passkey?: {
    id: string;
    name: string | null;
    createdAt: string;
  };
  error?: string;
}

export const registerPasskey = async (
  accessToken: string,
  name?: string,
): Promise<RegisterPasskeyResult> => {
  const optionsResponse = await fetch(API_ROUTES.AUTH.PASSKEY.REGISTER_OPTIONS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!optionsResponse.ok) {
    const data = (await optionsResponse.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Failed to get registration options" };
  }

  const options = (await optionsResponse.json()) as PublicKeyCredentialCreationOptionsJSON;

  let credential;
  try {
    credential = await startRegistration({ optionsJSON: options });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return { ok: false, error: "cancelled" };
      }
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Registration failed" };
  }

  const derivedName = name ?? derivePasskeyName(credential.authenticatorAttachment);

  const verifyResponse = await fetch(API_ROUTES.AUTH.PASSKEY.REGISTER_VERIFY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      response: credential,
      challenge: options.challenge,
      name: derivedName,
    }),
  });

  if (!verifyResponse.ok) {
    const data = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Verification failed" };
  }

  const result = (await verifyResponse.json()) as RegisterPasskeyResult;
  return result;
};

export interface AuthenticatePasskeyResult {
  ok: boolean;
  accessToken?: string;
  expiresIn?: number;
  error?: string;
}

export const authenticateWithPasskey = async (): Promise<AuthenticatePasskeyResult> => {
  const optionsResponse = await fetch(API_ROUTES.AUTH.PASSKEY.AUTHENTICATE_OPTIONS, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  });

  if (!optionsResponse.ok) {
    const data = (await optionsResponse.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Failed to get authentication options" };
  }

  const options = (await optionsResponse.json()) as PublicKeyCredentialRequestOptionsJSON;

  let credential;
  try {
    credential = await startAuthentication({ optionsJSON: options });
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "NotAllowedError") {
        return { ok: false, error: "cancelled" };
      }
      return { ok: false, error: error.message };
    }
    return { ok: false, error: "Authentication failed" };
  }

  const verifyResponse = await fetch(API_ROUTES.AUTH.PASSKEY.AUTHENTICATE_VERIFY, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      response: credential,
      challenge: options.challenge,
    }),
  });

  if (!verifyResponse.ok) {
    const data = (await verifyResponse.json().catch(() => null)) as { error?: string } | null;
    return { ok: false, error: data?.error ?? "Verification failed" };
  }

  const result = (await verifyResponse.json()) as {
    access_token: string;
    expires_in: number;
    token_type: string;
  };

  return {
    ok: true,
    accessToken: result.access_token,
    expiresIn: result.expires_in,
  };
};
