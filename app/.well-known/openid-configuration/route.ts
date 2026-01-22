import { NextResponse } from "next/server";

import { API_ROUTES } from "@/lib/api/routes";
import { serverEnv } from "@/lib/config/env";

export async function GET() {
  const issuer = serverEnv.BNF_JWT_ISSUER;

  return NextResponse.json({
    grant_types_supported: ["urn:bonfire:grant-type:email-otp"],
    id_token_signing_alg_values_supported: ["EdDSA"],
    issuer,
    jwks_uri: `${issuer}${API_ROUTES.AUTH.JWKS}`,
    response_types_supported: ["token"],
    scopes_supported: ["openid"],
    subject_types_supported: ["public"],
    token_endpoint: `${issuer}${API_ROUTES.AUTH.TOKENS}`,
    token_endpoint_auth_methods_supported: ["none"],
  });
}
