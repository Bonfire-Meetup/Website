import { exportJWK, importSPKI } from "jose";
import { NextResponse } from "next/server";
import { serverEnv } from "@/app/lib/config/env";

const getJwtPublicKey = () => {
  return serverEnv.BNF_JWT_PUBLIC_KEY;
};

const getJwtKeyId = () => serverEnv.BNF_JWT_KEY_ID ?? "bnf-auth";

export async function GET() {
  const publicKey = await importSPKI(getJwtPublicKey(), "EdDSA");
  const jwk = await exportJWK(publicKey);
  const key = { ...jwk, use: "sig", alg: "EdDSA", kid: getJwtKeyId() };
  return NextResponse.json({ keys: [key] });
}
