import { NextResponse } from "next/server";
import { serverEnv } from "@/lib/config/env";
import { API_ROUTES } from "@/lib/api/routes";

export async function GET() {
  const issuer = serverEnv.BNF_JWT_ISSUER;

  return NextResponse.json({
    issuer,
    jwks_uri: `${issuer}${API_ROUTES.AUTH.JWKS}`,
    token_endpoint: `${issuer}${API_ROUTES.AUTH.TOKENS}`,
    token_endpoint_auth_methods_supported: ["none"],
    grant_types_supported: ["urn:bonfire:grant-type:email-otp"],
    subject_types_supported: ["public"],
    id_token_signing_alg_values_supported: ["EdDSA"],
    response_types_supported: ["token"],
    scopes_supported: ["openid"],
  });
}
