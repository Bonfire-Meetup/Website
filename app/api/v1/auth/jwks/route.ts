import { exportJWK, importSPKI } from "jose";
import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/config/env";
import { logError } from "@/lib/utils/log";

const getJwtPublicKey = () => serverEnv.BNF_JWT_PUBLIC_KEY;

const getJwtKeyId = () => serverEnv.BNF_JWT_KEY_ID ?? "bnf-auth";

export async function GET() {
  try {
    const publicKey = await importSPKI(getJwtPublicKey(), "EdDSA");
    const jwk = await exportJWK(publicKey);
    const key = { ...jwk, alg: "EdDSA", kid: getJwtKeyId(), use: "sig" };
    return NextResponse.json({ keys: [key] });
  } catch (error) {
    logError("auth.jwks.failed", error);
    throw error;
  }
}
