import { NextResponse } from "next/server";
import { serverEnv } from "@/app/lib/config/env";

export async function GET() {
  const issuer = serverEnv.BNF_JWT_ISSUER;

  return NextResponse.json({
    issuer,
    jwks_uri: `${issuer}/api/v1/auth/jwks`,
    token_endpoint: `${issuer}/api/v1/auth/tokens`,
    token_endpoint_auth_methods_supported: ["none"],
    grant_types_supported: ["urn:bonfire:grant-type:email-otp"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["EdDSA"],
    response_types_supported: ["token"],
    scopes_supported: ["openid"],
  });
}
