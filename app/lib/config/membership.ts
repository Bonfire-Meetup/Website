export const MEMBERSHIP_TIERS = {
  TIER1: 1,
  TIER2: 2,
  TIER3: 3,
} as const;

export type MembershipTier = (typeof MEMBERSHIP_TIERS)[keyof typeof MEMBERSHIP_TIERS];

export const MEMBERSHIP_TIER_LABELS: Record<MembershipTier, string> = {
  [MEMBERSHIP_TIERS.TIER1]: "Scout",
  [MEMBERSHIP_TIERS.TIER2]: "Explorer",
  [MEMBERSHIP_TIERS.TIER3]: "Trailblazer",
};

export const hasMembership = (tier: number | null | undefined): boolean =>
  tier !== null && tier !== undefined && tier > 0;

export const hasMembershipTier = (
  userTier: number | null | undefined,
  requiredTier: MembershipTier,
): boolean =>
  userTier === requiredTier ||
  (userTier !== null && userTier !== undefined && userTier >= requiredTier);

export const GUILD_TIERS = MEMBERSHIP_TIERS;
export type GuildTier = MembershipTier;
export const isGuildMember = hasMembership;
