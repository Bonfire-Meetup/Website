import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const requestId = request.headers.get("x-bnf-request-id") ?? crypto.randomUUID();
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-bnf-request-id", requestId);

  const response = NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });

  response.headers.set("x-bnf-request-id", requestId);
  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};
