import { z } from "zod";

const clientSchema = z.object({
  NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY,
});
