import type { GuildMembershipTier } from "@/lib/config/guild-membership";

interface GuildTranslator {
  (key: string): string;
  raw(key: string): unknown;
}

export interface GuildTierCopy {
  badge: string;
  features: string[];
  name: string;
  tagline: string;
}

type GuildTierCopyMap = Record<GuildMembershipTier, GuildTierCopy>;

export const getGuildTierCopy = (t: GuildTranslator): GuildTierCopyMap => ({
  1: {
    name: t("tiers.scout.name"),
    tagline: t("tiers.scout.tagline"),
    badge: t("tiers.scout.badge"),
    features: t.raw("tiers.scout.features") as string[],
  },
  2: {
    name: t("tiers.explorer.name"),
    tagline: t("tiers.explorer.tagline"),
    badge: t("tiers.explorer.badge"),
    features: t.raw("tiers.explorer.features") as string[],
  },
  3: {
    name: t("tiers.trailblazer.name"),
    tagline: t("tiers.trailblazer.tagline"),
    badge: t("tiers.trailblazer.badge"),
    features: t.raw("tiers.trailblazer.features") as string[],
  },
});

export const getGuildTierName = (
  tiers: GuildTierCopyMap,
  tier: GuildMembershipTier | null | undefined,
): string | null => (tier ? tiers[tier].name : null);
