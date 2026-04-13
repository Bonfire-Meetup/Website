import "server-only";

import { serverEnv } from "@/lib/config/env";
import { GUILD_TIER_VALUES, type GuildMembershipTier } from "@/lib/config/guild-membership";

export { GUILD_TIER_VALUES, isGuildMembershipTier } from "@/lib/config/guild-membership";
export type { GuildMembershipTier } from "@/lib/config/guild-membership";

const tierPriceIds = serverEnv.BNF_STRIPE_GUILD_TIER_PRICE_IDS;

const priceIdByTier: Record<GuildMembershipTier, string | undefined> = {
  1: tierPriceIds?.["1"],
  2: tierPriceIds?.["2"],
  3: tierPriceIds?.["3"],
};

export const getGuildTierPriceId = (tier: GuildMembershipTier): string => {
  const priceId = priceIdByTier[tier];

  if (!priceId) {
    throw new Error(`Missing Stripe price ID for Guild tier ${tier}`);
  }

  return priceId;
};

export const getGuildTierByPriceId = (
  priceId: string | null | undefined,
): GuildMembershipTier | null => {
  if (!priceId) {
    return null;
  }

  const entry = Object.entries(priceIdByTier).find(([, value]) => value === priceId);

  if (!entry) {
    return null;
  }

  return Number(entry[0]) as GuildMembershipTier;
};

const normalizeBaseUrl = (value: string): string => value.replace(/\/$/, "");

export const getStripeAppBaseUrl = (request?: Request): string => {
  if (request) {
    const requestUrl = new URL(request.url);
    const forwardedHost = request.headers.get("x-forwarded-host");
    const forwardedProto = request.headers.get("x-forwarded-proto");

    if (forwardedHost) {
      return normalizeBaseUrl(
        `${forwardedProto ?? requestUrl.protocol.replace(":", "")}://${forwardedHost}`,
      );
    }

    if (
      requestUrl.hostname === "localhost" ||
      requestUrl.hostname === "127.0.0.1" ||
      requestUrl.hostname.endsWith(".local")
    ) {
      return normalizeBaseUrl(requestUrl.origin);
    }
  }

  const baseUrl = serverEnv.PROD_URL;

  if (!baseUrl) {
    throw new Error("Missing PROD_URL for Stripe redirects outside local request context");
  }

  return normalizeBaseUrl(baseUrl);
};

export const getStripePortalReturnUrl = (request?: Request): string =>
  normalizeBaseUrl(serverEnv.BNF_STRIPE_PORTAL_RETURN_URL ?? `${getStripeAppBaseUrl(request)}/me`);
