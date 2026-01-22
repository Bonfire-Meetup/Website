import crypto from "crypto";

import { NextResponse } from "next/server";

import { serverEnv } from "@/lib/config/env";
import { logError, logInfo } from "@/lib/utils/log";

const CSRF_COOKIE_NAME = "bnf_csrf";
const CSRF_TTL_SECONDS = 60 * 60;

export async function GET() {
  try {
    const token = crypto.randomBytes(32).toString("hex");
    const response = NextResponse.json({ token });
    response.cookies.set(CSRF_COOKIE_NAME, token, {
      httpOnly: true,
      maxAge: CSRF_TTL_SECONDS,
      path: "/",
      sameSite: "strict",
      secure: serverEnv.NODE_ENV === "production",
    });
    logInfo("csrf.token_generated");

    return response;
  } catch (error) {
    logError("csrf.generation_failed", error);
    throw error;
  }
}
