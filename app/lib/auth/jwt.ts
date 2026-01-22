import { SignJWT, importPKCS8, importSPKI, jwtVerify } from "jose";

import { serverEnv } from "@/lib/config/env";
import { isAuthTokenActive } from "@/lib/data/auth";

const getJwtIssuer = () => serverEnv.BNF_JWT_ISSUER;

const getJwtAudience = () => serverEnv.BNF_JWT_AUDIENCE;

const normalizePem = (pem: string): string => {
  if (pem.includes("\n")) {
    return pem;
  }

  return pem
    .replace(/(-----BEGIN [A-Z ]+-----)/, "$1\n")
    .replace(/(-----END [A-Z ]+-----)/, "\n$1");
};

const getJwtPrivateKey = () => normalizePem(serverEnv.BNF_JWT_PRIVATE_KEY);

const getJwtPublicKey = () => normalizePem(serverEnv.BNF_JWT_PUBLIC_KEY);

const getJwtKeyId = () => serverEnv.BNF_JWT_KEY_ID ?? "bnf-auth";

const accessTokenTtlSeconds = 60 * 60 * 24 * 3;

export const getAccessTokenTtlSeconds = () => accessTokenTtlSeconds;

export const signAccessToken = async (userId: string, jti: string) => {
  const privateKey = await importPKCS8(getJwtPrivateKey(), "EdDSA");

  return new SignJWT({})
    .setProtectedHeader({ alg: "EdDSA", kid: getJwtKeyId(), typ: "JWT" })
    .setIssuer(getJwtIssuer())
    .setAudience(getJwtAudience())
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(`${accessTokenTtlSeconds}s`)
    .setJti(jti)
    .sign(privateKey);
};

export const verifyAccessToken = async (token: string) => {
  const publicKey = await importSPKI(getJwtPublicKey(), "EdDSA");
  const { payload } = await jwtVerify(token, publicKey, {
    audience: getJwtAudience(),
    issuer: getJwtIssuer(),
  });

  if (typeof payload.sub !== "string") {
    throw new Error("Invalid token subject");
  }

  if (typeof payload.jti !== "string") {
    throw new Error("Invalid token id");
  }

  const isActive = await isAuthTokenActive(payload.jti);

  if (!isActive) {
    throw new Error("Token revoked");
  }

  return payload;
};
