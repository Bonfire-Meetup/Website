import crypto from "crypto";
import { NextResponse } from "next/server";
import { serverEnv } from "@/app/lib/config/env";

const CSRF_COOKIE_NAME = "bnf_csrf";
const CSRF_TTL_SECONDS = 60 * 60;

export async function GET() {
  const token = crypto.randomBytes(32).toString("hex");
  const response = NextResponse.json({ token });
  response.cookies.set(CSRF_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: serverEnv.NODE_ENV === "production",
    path: "/",
    maxAge: CSRF_TTL_SECONDS,
  });
  return response;
}
