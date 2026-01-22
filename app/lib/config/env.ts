import { z } from "zod";

const serverSchema = z.object({
  BNF_DB_PROVIDER: z.enum(["neon"]).optional(),
  BNF_HEARTS_SALT: z.string().min(1),
  BNF_JWT_AUDIENCE: z.string().min(1),
  BNF_JWT_ISSUER: z.string().min(1),
  BNF_JWT_KEY_ID: z.string().min(1).optional(),
  BNF_JWT_PRIVATE_KEY: z.string().min(1),
  BNF_JWT_PUBLIC_KEY: z.string().min(1),
  BNF_LOG_SALT: z.string().min(1).optional(),
  BNF_NEON_DATABASE_URL: z.string().min(1),
  BNF_OTP_SECRET: z.string().min(1),
  BNF_RESEND_API_KEY: z.string().min(1),
  BNF_RESEND_AUTH_FROM: z.string().min(1).optional(),
  BNF_RESEND_FROM: z.string().min(1),
  BNF_TURNSTILE_SECRET_KEY: z.string().min(1),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
});

const clientSchema = z.object({
  NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY: z.string().min(1).optional(),
});

const isServer = typeof window === "undefined";

export const serverEnv = isServer
  ? serverSchema.parse({
      BNF_DB_PROVIDER: process.env.BNF_DB_PROVIDER,
      BNF_HEARTS_SALT: process.env.BNF_HEARTS_SALT,
      BNF_JWT_AUDIENCE: process.env.BNF_JWT_AUDIENCE,
      BNF_JWT_ISSUER: process.env.BNF_JWT_ISSUER,
      BNF_JWT_KEY_ID: process.env.BNF_JWT_KEY_ID,
      BNF_JWT_PRIVATE_KEY: process.env.BNF_JWT_PRIVATE_KEY,
      BNF_JWT_PUBLIC_KEY: process.env.BNF_JWT_PUBLIC_KEY,
      BNF_LOG_SALT: process.env.BNF_LOG_SALT,
      BNF_NEON_DATABASE_URL: process.env.BNF_NEON_DATABASE_URL,
      BNF_OTP_SECRET: process.env.BNF_OTP_SECRET,
      BNF_RESEND_API_KEY: process.env.BNF_RESEND_API_KEY,
      BNF_RESEND_AUTH_FROM: process.env.BNF_RESEND_AUTH_FROM,
      BNF_RESEND_FROM: process.env.BNF_RESEND_FROM,
      BNF_TURNSTILE_SECRET_KEY: process.env.BNF_TURNSTILE_SECRET_KEY,
      NODE_ENV: process.env.NODE_ENV,
    })
  : ({} as z.infer<typeof serverSchema>);

export const clientEnv = clientSchema.parse({
  NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY: process.env.NEXT_PUBLIC_BNF_TURNSTILE_SITE_KEY,
});
