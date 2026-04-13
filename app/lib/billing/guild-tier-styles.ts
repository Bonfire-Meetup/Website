import type { GuildMembershipTier } from "@/lib/config/guild-membership";

export interface GuildTierPillStyle {
  blur: string;
  border: string;
  glow: string;
  icon: string;
  shadow: string;
  text: string;
}

export const GUILD_TIER_PILL_STYLES: Record<GuildMembershipTier, GuildTierPillStyle> = {
  1: {
    glow: "radial-gradient(circle, rgba(14,165,233,0.5) 0%, rgba(59,130,246,0.3) 50%, transparent 70%)",
    blur: "linear-gradient(135deg, rgba(14,165,233,0.6), rgba(59,130,246,0.4), rgba(14,165,233,0.5))",
    border: "border-sky-400/30 dark:border-sky-400/40",
    shadow: "shadow-sky-500/15 dark:shadow-sky-500/20",
    icon: "text-sky-500 dark:text-sky-400",
    text: "from-sky-500 via-blue-500 to-sky-600 dark:from-sky-300 dark:via-blue-300 dark:to-sky-300",
  },
  2: {
    glow: "radial-gradient(circle, rgba(251,146,60,0.5) 0%, rgba(249,115,22,0.3) 50%, transparent 70%)",
    blur: "linear-gradient(135deg, rgba(251,146,60,0.6), rgba(249,115,22,0.4), rgba(251,146,60,0.5))",
    border: "border-amber-400/30 dark:border-amber-400/40",
    shadow: "shadow-amber-500/15 dark:shadow-amber-500/20",
    icon: "text-amber-500 dark:text-amber-400",
    text: "from-amber-500 via-orange-500 to-amber-600 dark:from-amber-300 dark:via-orange-300 dark:to-amber-300",
  },
  3: {
    glow: "radial-gradient(circle, rgba(244,63,94,0.5) 0%, rgba(236,72,153,0.3) 50%, transparent 70%)",
    blur: "linear-gradient(135deg, rgba(244,63,94,0.6), rgba(236,72,153,0.4), rgba(244,63,94,0.5))",
    border: "border-rose-400/30 dark:border-rose-400/40",
    shadow: "shadow-rose-500/15 dark:shadow-rose-500/20",
    icon: "text-rose-500 dark:text-rose-400",
    text: "from-rose-500 via-pink-500 to-rose-600 dark:from-rose-300 dark:via-pink-300 dark:to-rose-300",
  },
};

export function resolveGuildTierPillStyle(tier: number | null | undefined): GuildTierPillStyle {
  if (tier === 1 || tier === 2 || tier === 3) {
    return GUILD_TIER_PILL_STYLES[tier];
  }
  return GUILD_TIER_PILL_STYLES[2];
}

export interface GuildTierPreviewTint {
  card: string;
  darkGlow: string;
  darkGlowStrong: string;
  glow: string;
  glowStrong: string;
  iconAccent: string;
  ring: string;
}

export const GUILD_TIER_PREVIEW_TINTS: Record<GuildMembershipTier, GuildTierPreviewTint> = {
  1: {
    glow: "rgba(14,165,233,0.08)",
    glowStrong: "rgba(59,130,246,0.10)",
    darkGlow: "rgba(56,189,248,0.18)",
    darkGlowStrong: "rgba(96,165,250,0.24)",
    ring: "border-sky-200/70 dark:border-sky-500/20",
    card: "from-sky-50/70 via-white to-blue-50/60 dark:from-sky-500/10 dark:via-neutral-950 dark:to-blue-500/8",
    iconAccent: "text-sky-500 dark:text-sky-400",
  },
  2: {
    glow: "rgba(245,158,11,0.08)",
    glowStrong: "rgba(249,115,22,0.10)",
    darkGlow: "rgba(251,191,36,0.18)",
    darkGlowStrong: "rgba(249,115,22,0.24)",
    ring: "border-amber-200/70 dark:border-amber-500/20",
    card: "from-amber-50/70 via-white to-orange-50/60 dark:from-amber-500/10 dark:via-neutral-950 dark:to-orange-500/8",
    iconAccent: "text-amber-500 dark:text-amber-400",
  },
  3: {
    glow: "rgba(244,63,94,0.08)",
    glowStrong: "rgba(236,72,153,0.10)",
    darkGlow: "rgba(251,113,133,0.18)",
    darkGlowStrong: "rgba(244,114,182,0.24)",
    ring: "border-rose-200/70 dark:border-rose-500/20",
    card: "from-rose-50/70 via-white to-pink-50/60 dark:from-rose-500/10 dark:via-neutral-950 dark:to-pink-500/8",
    iconAccent: "text-rose-500 dark:text-rose-400",
  },
};

export interface GuildTierMarketingCardStyle {
  accent: string;
  actionClassName: string;
  badge: string;
  border: string;
  glow: string;
  gradient: string;
  iconBg: string;
  selectedGlow: string;
}

export const GUILD_TIER_MARKETING_CARD_STYLES: Record<
  GuildMembershipTier,
  GuildTierMarketingCardStyle
> = {
  1: {
    accent: "text-sky-600 dark:text-sky-400",
    glow: "bg-sky-500/10 dark:bg-sky-500/5",
    selectedGlow: "bg-sky-400/20 dark:bg-sky-400/28",
    gradient:
      "bg-gradient-to-br from-sky-200/60 via-transparent to-blue-200/40 dark:from-sky-500/20 dark:to-blue-500/10",
    border: "border-sky-200/60 dark:border-sky-500/20",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    actionClassName:
      "bg-gradient-to-r from-sky-500 via-sky-500 to-blue-600 hover:shadow-[0_18px_34px_-18px_rgba(14,165,233,0.42)]",
    badge:
      "border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
  },
  2: {
    accent: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-500/10 dark:bg-amber-500/5",
    selectedGlow: "bg-amber-400/20 dark:bg-amber-400/28",
    gradient:
      "bg-gradient-to-br from-amber-200/60 via-transparent to-orange-200/40 dark:from-amber-500/20 dark:to-orange-500/10",
    border: "border-amber-200/60 dark:border-amber-500/20",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    actionClassName:
      "bg-gradient-to-r from-amber-500 via-orange-500 to-orange-600 hover:shadow-[0_20px_36px_-18px_rgba(249,115,22,0.45)]",
    badge:
      "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
  },
  3: {
    accent: "text-rose-600 dark:text-rose-400",
    glow: "bg-rose-500/10 dark:bg-rose-500/5",
    selectedGlow: "bg-rose-400/20 dark:bg-rose-400/28",
    gradient:
      "bg-gradient-to-br from-rose-200/60 via-transparent to-red-200/40 dark:from-rose-500/20 dark:to-red-500/10",
    border: "border-rose-200/60 dark:border-rose-500/20",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    actionClassName:
      "bg-gradient-to-r from-rose-500 via-red-500 to-pink-600 shadow-[0_18px_34px_-18px_rgba(244,63,94,0.42)] hover:shadow-[0_22px_38px_-18px_rgba(244,63,94,0.5)]",
    badge:
      "border border-rose-200 bg-rose-50/90 text-rose-700 shadow-sm shadow-rose-100/70 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300 dark:shadow-none",
  },
};

export interface GuildTierJoinStyle {
  accent: string;
  badge: string;
  checkBg: string;
  ctaGlow: string;
  ctaGradient: string;
  glow: string;
  glowColor: string;
  iconBg: string;
}

export const GUILD_TIER_JOIN_STYLES: Record<GuildMembershipTier, GuildTierJoinStyle> = {
  1: {
    accent: "text-sky-600 dark:text-sky-400",
    glow: "bg-sky-400",
    glowColor: "rgba(14,165,233,0.12)",
    badge:
      "border border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300",
    iconBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    checkBg: "bg-gradient-to-br from-sky-500 to-blue-600",
    ctaGradient: "from-sky-500 via-sky-500 to-blue-500",
    ctaGlow: "shadow-[0_16px_36px_-12px_rgba(14,165,233,0.5)]",
  },
  2: {
    accent: "text-amber-600 dark:text-amber-400",
    glow: "bg-amber-400",
    glowColor: "rgba(245,158,11,0.12)",
    badge:
      "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    checkBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    ctaGradient: "from-amber-500 via-orange-500 to-orange-600",
    ctaGlow: "shadow-[0_16px_36px_-12px_rgba(245,158,11,0.5)]",
  },
  3: {
    accent: "text-rose-600 dark:text-rose-400",
    glow: "bg-rose-400",
    glowColor: "rgba(244,63,94,0.12)",
    badge:
      "border border-rose-200 bg-rose-50/90 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    checkBg: "bg-gradient-to-br from-rose-500 to-red-600",
    ctaGradient: "from-rose-500 via-red-500 to-pink-600",
    ctaGlow: "shadow-[0_16px_36px_-12px_rgba(244,63,94,0.5)]",
  },
};

export interface GuildTierMemberCardStyle {
  badge: string;
  body: string;
  button: string;
  check: string;
  divider: string;
  glow: string;
  pill: string;
  stripe: string;
  title: string;
}

export const GUILD_TIER_MEMBER_CARD_STYLES: Record<GuildMembershipTier, GuildTierMemberCardStyle> =
  {
    1: {
      badge:
        "border-sky-200/70 bg-sky-50/80 text-sky-700 dark:border-sky-500/25 dark:bg-sky-500/10 dark:text-sky-300",
      body: "border-sky-200/70 from-white via-sky-50/70 to-blue-50/80 dark:border-sky-400/20 dark:from-sky-500/10 dark:via-blue-500/8 dark:to-blue-500/8",
      glow: "from-sky-200/35 via-blue-200/10 dark:from-sky-500/12 dark:via-blue-500/6",
      stripe:
        "from-sky-400 via-blue-400 to-sky-500 dark:from-sky-500 dark:via-blue-400 dark:to-sky-400",
      button:
        "border-sky-300/40 from-sky-500 via-sky-500 to-blue-600 hover:border-sky-300/55 hover:shadow-[0_18px_34px_-16px_rgba(14,165,233,0.34)] dark:border-sky-300/25 dark:hover:border-sky-300/38",
      pill: "border-sky-200/80 bg-sky-100/85 text-sky-900 dark:border-sky-400/20 dark:bg-sky-500/16 dark:text-sky-100",
      title: "text-sky-700 dark:text-sky-300",
      check: "text-sky-600 dark:text-sky-400",
      divider: "border-sky-200/50 dark:border-sky-500/15",
    },
    2: {
      badge:
        "border-amber-200/70 bg-amber-50/80 text-amber-700 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-amber-300",
      body: "border-amber-200/70 from-white via-amber-50/70 to-orange-50/80 dark:border-amber-400/20 dark:from-amber-500/10 dark:via-orange-500/8 dark:to-orange-500/8",
      glow: "from-amber-200/35 via-orange-200/10 dark:from-amber-500/12 dark:via-orange-500/6",
      stripe:
        "from-amber-400 via-orange-400 to-amber-500 dark:from-amber-500 dark:via-orange-400 dark:to-amber-400",
      button:
        "border-amber-300/40 from-amber-500 via-orange-500 to-orange-600 hover:border-amber-300/55 hover:shadow-[0_18px_34px_-16px_rgba(245,158,11,0.34)] dark:border-amber-300/25 dark:hover:border-amber-300/38",
      pill: "border-amber-200/80 bg-amber-100/85 text-amber-950 dark:border-amber-400/20 dark:bg-amber-500/16 dark:text-amber-100",
      title: "text-amber-700 dark:text-amber-300",
      check: "text-amber-600 dark:text-amber-400",
      divider: "border-amber-200/50 dark:border-amber-500/15",
    },
    3: {
      badge:
        "border-rose-200/70 bg-rose-50/80 text-rose-700 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-rose-300",
      body: "border-rose-200/70 from-white via-rose-50/70 to-pink-50/80 dark:border-rose-400/20 dark:from-rose-500/10 dark:via-pink-500/8 dark:to-red-500/8",
      glow: "from-rose-200/35 via-pink-200/10 dark:from-rose-500/12 dark:via-pink-500/6",
      stripe:
        "from-rose-400 via-pink-400 to-rose-500 dark:from-rose-500 dark:via-pink-400 dark:to-rose-400",
      button:
        "border-rose-300/40 from-rose-500 via-pink-500 to-red-600 hover:border-rose-300/55 hover:shadow-[0_18px_34px_-16px_rgba(244,63,94,0.34)] dark:border-rose-300/25 dark:hover:border-rose-300/38",
      pill: "border-rose-200/80 bg-rose-100/85 text-rose-950 dark:border-rose-400/20 dark:bg-rose-500/16 dark:text-rose-100",
      title: "text-rose-700 dark:text-rose-300",
      check: "text-rose-600 dark:text-rose-400",
      divider: "border-rose-200/50 dark:border-rose-500/15",
    },
  };

export type GuildFlameTier = 0 | GuildMembershipTier;

export const GUILD_TIER_FLAME_WASH_CLASS: Record<GuildFlameTier, string> = {
  0: "from-amber-200/35 via-orange-200/12 to-transparent dark:from-amber-500/12 dark:via-orange-500/8 dark:to-transparent",
  1: "from-sky-200/35 via-blue-200/10 to-transparent dark:from-sky-500/12 dark:via-blue-500/8 dark:to-transparent",
  2: "from-amber-200/35 via-orange-200/12 to-transparent dark:from-amber-500/12 dark:via-orange-500/8 dark:to-transparent",
  3: "from-rose-200/35 via-pink-200/12 to-transparent dark:from-rose-500/12 dark:via-pink-500/8 dark:to-transparent",
};
