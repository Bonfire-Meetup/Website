import "server-only";

import { z } from "zod";

const guildTierStripePriceIdRecordSchema = z.record(z.enum(["1", "2", "3"]), z.string().min(1));

const serverSchema = z.object({
  BNF_DB_PROVIDER: z.enum(["neon"]).optional(),
  BNF_DISABLE_DB_DURING_BUILD: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value === "1" || value.toLowerCase() === "true";
      }
      return value;
    }, z.boolean())
    .optional()
    .default(false),
  BNF_ENABLE_GUILD_SUBSCRIPTION: z
    .preprocess((value) => {
      if (typeof value === "string") {
        return value === "1" || value.toLowerCase() === "true";
      }
      return value;
    }, z.boolean())
    .optional()
    .default(false),
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
  BNF_RESEND_NEWSLETTER_FROM: z.string().min(1).optional(),
  BNF_STRIPE_GUILD_TIER_PRICE_IDS: z.preprocess((value) => {
    if (typeof value !== "string") {
      return undefined;
    }
    const trimmed = value.trim();
    if (trimmed === "") {
      return undefined;
    }
    try {
      return JSON.parse(trimmed) as unknown;
    } catch (cause) {
      throw new Error("BNF_STRIPE_GUILD_TIER_PRICE_IDS must be valid JSON", { cause });
    }
  }, guildTierStripePriceIdRecordSchema.optional()),
  BNF_STRIPE_PORTAL_RETURN_URL: z.string().url().optional(),
  BNF_STRIPE_SECRET_KEY: z.string().min(1).optional(),
  BNF_STRIPE_WEBHOOK_SECRET: z.string().min(1).optional(),
  BNF_TURNSTILE_SECRET_KEY: z.string().min(1),
  BNF_WEBAUTHN_RP_ID: z.string().min(1).optional(),
  BNF_WEBAUTHN_RP_NAME: z.string().min(1).optional(),
  BNF_WEBAUTHN_ORIGIN: z.string().url().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  PROD_URL: z.string().url().optional(),
});

const isServer = typeof window === "undefined";

export const serverEnv = isServer
  ? serverSchema.parse({
      BNF_DB_PROVIDER: process.env.BNF_DB_PROVIDER,
      BNF_DISABLE_DB_DURING_BUILD: process.env.BNF_DISABLE_DB_DURING_BUILD,
      BNF_ENABLE_GUILD_SUBSCRIPTION: process.env.BNF_ENABLE_GUILD_SUBSCRIPTION,
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
      BNF_RESEND_NEWSLETTER_FROM: process.env.BNF_RESEND_NEWSLETTER_FROM,
      BNF_STRIPE_GUILD_TIER_PRICE_IDS: process.env.BNF_STRIPE_GUILD_TIER_PRICE_IDS,
      BNF_STRIPE_PORTAL_RETURN_URL: process.env.BNF_STRIPE_PORTAL_RETURN_URL,
      BNF_STRIPE_SECRET_KEY: process.env.BNF_STRIPE_SECRET_KEY,
      BNF_STRIPE_WEBHOOK_SECRET: process.env.BNF_STRIPE_WEBHOOK_SECRET,
      BNF_TURNSTILE_SECRET_KEY: process.env.BNF_TURNSTILE_SECRET_KEY,
      BNF_WEBAUTHN_RP_ID: process.env.BNF_WEBAUTHN_RP_ID,
      BNF_WEBAUTHN_RP_NAME: process.env.BNF_WEBAUTHN_RP_NAME,
      BNF_WEBAUTHN_ORIGIN: process.env.BNF_WEBAUTHN_ORIGIN,
      NODE_ENV: process.env.NODE_ENV,
      PROD_URL: process.env.PROD_URL,
    })
  : ({} as z.infer<typeof serverSchema>);
