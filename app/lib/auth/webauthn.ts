import type { PasskeyRow } from "@/lib/data/passkey";
import {
  generateAuthenticationOptions,
  generateRegistrationOptions,
  verifyAuthenticationResponse,
  verifyRegistrationResponse,
  type AuthenticationResponseJSON,
  type AuthenticatorTransportFuture,
  type CredentialDeviceType,
  type PublicKeyCredentialCreationOptionsJSON,
  type PublicKeyCredentialRequestOptionsJSON,
  type RegistrationResponseJSON,
} from "@simplewebauthn/server";

import { serverEnv } from "@/lib/config/env";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export const getWebAuthnConfig = () => {
  const rpId = serverEnv.BNF_WEBAUTHN_RP_ID ?? "localhost";
  const rpName = serverEnv.BNF_WEBAUTHN_RP_NAME ?? "Bonfire";
  const origin = serverEnv.BNF_WEBAUTHN_ORIGIN ?? `https://${rpId}`;

  return { rpId, rpName, origin };
};

export const getChallengeTtlMs = () => CHALLENGE_TTL_MS;

export const createRegistrationOptions = async ({
  userId,
  userEmail,
  userName,
  existingPasskeys,
}: {
  userId: string;
  userEmail: string;
  userName?: string | null;
  existingPasskeys: PasskeyRow[];
}): Promise<PublicKeyCredentialCreationOptionsJSON> => {
  const { rpId, rpName } = getWebAuthnConfig();

  const options = await generateRegistrationOptions({
    rpName,
    rpID: rpId,
    userName: userEmail,
    userDisplayName: userName ?? userEmail,
    userID: new TextEncoder().encode(userId),
    attestationType: "none",
    excludeCredentials: existingPasskeys.map((passkey) => ({
      id: passkey.credential_id,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    })),
    authenticatorSelection: {
      residentKey: "required",
      requireResidentKey: true,
      userVerification: "required",
    },
  });

  return options;
};

export const verifyRegistration = async ({
  response,
  expectedChallenge,
}: {
  response: RegistrationResponseJSON;
  expectedChallenge: string;
}) => {
  const { rpId, origin } = getWebAuthnConfig();

  const verification = await verifyRegistrationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpId,
    requireUserVerification: true,
  });

  return verification;
};

export const createAuthenticationOptions = async ({
  allowedPasskeys,
}: {
  allowedPasskeys?: PasskeyRow[];
} = {}): Promise<PublicKeyCredentialRequestOptionsJSON> => {
  const { rpId } = getWebAuthnConfig();

  const options = await generateAuthenticationOptions({
    rpID: rpId,
    userVerification: "required",
    allowCredentials: allowedPasskeys?.map((passkey) => ({
      id: passkey.credential_id,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    })),
  });

  return options;
};

export const verifyAuthentication = async ({
  response,
  expectedChallenge,
  passkey,
}: {
  response: AuthenticationResponseJSON;
  expectedChallenge: string;
  passkey: PasskeyRow;
}) => {
  const { rpId, origin } = getWebAuthnConfig();

  const verification = await verifyAuthenticationResponse({
    response,
    expectedChallenge,
    expectedOrigin: origin,
    expectedRPID: rpId,
    credential: {
      id: passkey.credential_id,
      publicKey: Buffer.from(passkey.public_key, "base64url"),
      counter: passkey.counter,
      transports: passkey.transports as AuthenticatorTransportFuture[] | undefined,
    },
    requireUserVerification: true,
  });

  return verification;
};

export const formatDeviceType = (deviceType: CredentialDeviceType | undefined): string | null => {
  if (!deviceType) {
    return null;
  }

  return deviceType;
};

export const encodePublicKey = (publicKey: Uint8Array): string =>
  Buffer.from(publicKey).toString("base64url");
