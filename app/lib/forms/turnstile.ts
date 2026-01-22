import { serverEnv } from "@/lib/config/env";

const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyTurnstileToken = async (token: string) => {
  if (!token) {
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      body: new URLSearchParams({
        response: token,
        secret: serverEnv.BNF_TURNSTILE_SECRET_KEY,
      }),
      cache: "no-store",
      method: "POST",
    });

    if (!response.ok) {
      return false;
    }
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch {
    return false;
  }
};
