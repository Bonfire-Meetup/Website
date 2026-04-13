import "server-only";

import { getLocale } from "next-intl/server";
import { cacheLife } from "next/cache";

import { getStripe } from "@/lib/billing/stripe";
import { CACHE_LIFETIMES } from "@/lib/config/cache-lifetimes";
import { isGuildSubscriptionEnabled } from "@/lib/config/guild-subscription-feature";
import {
  GUILD_TIER_VALUES,
  getGuildTierPriceId,
  type GuildMembershipTier,
} from "@/lib/config/subscriptions";
import { logError } from "@/lib/utils/log";

const formatFallbackPrice = (locale: "en" | "cs") =>
  locale === "cs" ? "Cena v účtu" : "Pricing in account";

const formatComingSoonPrice = (locale: "en" | "cs") => (locale === "cs" ? "Brzy" : "Coming soon");

export async function getFormattedGuildTierPrices() {
  "use cache";
  cacheLife({ revalidate: CACHE_LIFETIMES.STRIPE_PRICES });

  const locale = (await getLocale()) as "en" | "cs";

  if (!isGuildSubscriptionEnabled()) {
    return Object.fromEntries(
      GUILD_TIER_VALUES.map((tier) => [tier, formatComingSoonPrice(locale)]),
    ) as Record<GuildMembershipTier, string>;
  }

  const stripe = getStripe();

  const priceEntries = await Promise.all(
    GUILD_TIER_VALUES.map(async (tier) => {
      try {
        const configuredId = getGuildTierPriceId(tier);

        if (!configuredId.startsWith("price_")) {
          throw new Error(
            `Guild tier ${tier} expects a Stripe price ID (price_...), received ${configuredId}`,
          );
        }

        const price = await stripe.prices.retrieve(configuredId);

        if (!price.unit_amount || !price.currency) {
          throw new Error(`Stripe price ${price.id} is missing unit_amount or currency`);
        }

        return [
          tier,
          new Intl.NumberFormat(locale, {
            style: "currency",
            currency: price.currency.toUpperCase(),
          }).format(price.unit_amount / 100),
        ] as const;
      } catch (error) {
        logError("billing.guild_price_fetch_failed", error, { tier });
        return [tier, formatFallbackPrice(locale)] as const;
      }
    }),
  );

  return Object.fromEntries(priceEntries) as Record<GuildMembershipTier, string>;
}
