export const GUILD_TIER_VALUES = [1, 2, 3] as const;

export type GuildMembershipTier = (typeof GUILD_TIER_VALUES)[number];

export const isGuildMembershipTier = (value: unknown): value is GuildMembershipTier =>
  value === 1 || value === 2 || value === 3;
