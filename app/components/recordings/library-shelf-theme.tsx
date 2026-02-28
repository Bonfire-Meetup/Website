import type { ComponentType } from "react";

import { ENGAGEMENT_BRANDING } from "@/lib/config/engagement-branding";
import { LIBRARY_SHELVES, type LibraryShelf } from "@/lib/recordings/library-filter";

import { BoltIcon, EarlyAccessIcon, FireIcon, GuildIcon, SparklesIcon } from "../shared/Icons";

type ShelfRowKey = "earlyAccess" | "guildVault" | "memberPicks" | "hot" | "hiddenGems";
type BrandedLibraryShelf = Exclude<LibraryShelf, "all">;

export interface LibraryShelfTheme {
  keyPrefix: string;
  rowKey: ShelfRowKey;
  icon: ComponentType<{ className?: string }>;
  rail: {
    iconClassName: string;
    accentClassName: string;
    containerClassName: string;
    gradientFrom: string;
    gradientTo: string;
  };
  browse: {
    iconClassName: string;
    glow: string;
    header: string;
    surface: string;
    filters: string;
    divider: string;
    closeButton: string;
  };
}

const boostColors = ENGAGEMENT_BRANDING.boost.colors;
const likeColors = ENGAGEMENT_BRANDING.like.colors;

export const LIBRARY_SHELF_THEMES = {
  [LIBRARY_SHELVES.EARLY_ACCESS]: {
    keyPrefix: "early-access",
    rowKey: "earlyAccess",
    icon: EarlyAccessIcon,
    rail: {
      iconClassName: "h-5 w-5 text-amber-500 dark:text-amber-300",
      accentClassName:
        "flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-amber-400 to-rose-500",
      containerClassName:
        "rounded-[28px] px-4 py-3 ring-1 ring-amber-500/20 dark:ring-amber-300/20",
      gradientFrom: "from-rose-500/5",
      gradientTo: "to-orange-500/10",
    },
    browse: {
      iconClassName: "h-4 w-4 text-amber-600 dark:text-amber-300",
      glow: "bg-amber-500/12 dark:bg-amber-400/18",
      header:
        "border-amber-300/45 bg-amber-50/70 ring-1 ring-amber-500/10 dark:border-amber-400/25 dark:bg-amber-500/10 dark:ring-amber-400/20",
      surface: "bg-amber-100/80 dark:bg-amber-500/20",
      filters: "ring-1 ring-amber-500/10 bg-amber-50/20 dark:ring-amber-400/20 dark:bg-amber-500/5",
      divider: "from-transparent via-amber-500/30 to-transparent dark:via-amber-400/35",
      closeButton:
        "border-amber-300/35 bg-amber-100/75 text-amber-700 hover:bg-amber-100 dark:border-amber-400/25 dark:bg-amber-500/20 dark:text-amber-100 dark:hover:bg-amber-500/30",
    },
  },
  [LIBRARY_SHELVES.GUILD_VAULT]: {
    keyPrefix: "guild-vault",
    rowKey: "guildVault",
    icon: GuildIcon,
    rail: {
      iconClassName: "h-5 w-5 text-red-500 dark:text-red-300",
      accentClassName:
        "flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-red-500 to-rose-500",
      containerClassName: "rounded-[28px] px-4 py-3 ring-1 ring-red-500/20 dark:ring-red-300/20",
      gradientFrom: "from-red-500/5",
      gradientTo: "to-rose-500/10",
    },
    browse: {
      iconClassName: "h-4 w-4 text-red-600 dark:text-red-300",
      glow: "bg-rose-500/10 dark:bg-rose-400/16",
      header:
        "border-rose-300/45 bg-rose-50/65 ring-1 ring-rose-500/10 dark:border-rose-400/25 dark:bg-rose-500/10 dark:ring-rose-400/20",
      surface: "bg-rose-100/80 dark:bg-rose-500/20",
      filters: "ring-1 ring-rose-500/10 bg-rose-50/20 dark:ring-rose-400/20 dark:bg-rose-500/5",
      divider: "from-transparent via-rose-500/30 to-transparent dark:via-rose-400/35",
      closeButton:
        "border-rose-300/35 bg-rose-100/75 text-rose-700 hover:bg-rose-100 dark:border-rose-400/25 dark:bg-rose-500/20 dark:text-rose-100 dark:hover:bg-rose-500/30",
    },
  },
  [LIBRARY_SHELVES.MEMBER_PICKS]: {
    keyPrefix: "member-pick",
    rowKey: "memberPicks",
    icon: BoltIcon,
    rail: {
      iconClassName: `h-5 w-5 text-${boostColors.gradientFrom}`,
      accentClassName: `flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${boostColors.gradientFrom} to-${boostColors.gradientTo}`,
      containerClassName: "rounded-[28px] px-4 py-3",
      gradientFrom: `from-${boostColors.railLight}`,
      gradientTo: `to-${boostColors.railLightSecondary}`,
    },
    browse: {
      iconClassName: "h-4 w-4 text-emerald-600 dark:text-emerald-300",
      glow: "bg-emerald-500/10 dark:bg-emerald-400/16",
      header:
        "border-emerald-300/45 bg-emerald-50/65 ring-1 ring-emerald-500/10 dark:border-emerald-400/25 dark:bg-emerald-500/10 dark:ring-emerald-400/20",
      surface: "bg-emerald-100/80 dark:bg-emerald-500/20",
      filters:
        "ring-1 ring-emerald-500/10 bg-emerald-50/20 dark:ring-emerald-400/20 dark:bg-emerald-500/5",
      divider: "from-transparent via-emerald-500/30 to-transparent dark:via-emerald-400/35",
      closeButton:
        "border-emerald-300/35 bg-emerald-100/75 text-emerald-700 hover:bg-emerald-100 dark:border-emerald-400/25 dark:bg-emerald-500/20 dark:text-emerald-100 dark:hover:bg-emerald-500/30",
    },
  },
  [LIBRARY_SHELVES.HOT]: {
    keyPrefix: "hot",
    rowKey: "hot",
    icon: FireIcon,
    rail: {
      iconClassName: `h-5 w-5 text-${likeColors.gradientTo}`,
      accentClassName: `flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-${likeColors.gradientFrom} to-${likeColors.gradientTo}`,
      containerClassName: "rounded-[28px] px-4 py-3",
      gradientFrom: `from-${likeColors.railLight}`,
      gradientTo: `to-${likeColors.railLightSecondary}`,
    },
    browse: {
      iconClassName: "h-4 w-4 text-rose-600 dark:text-rose-300",
      glow: "bg-orange-500/10 dark:bg-orange-400/16",
      header:
        "border-orange-300/45 bg-orange-50/65 ring-1 ring-orange-500/10 dark:border-orange-400/25 dark:bg-orange-500/10 dark:ring-orange-400/20",
      surface: "bg-orange-100/80 dark:bg-orange-500/20",
      filters:
        "ring-1 ring-orange-500/10 bg-orange-50/20 dark:ring-orange-400/20 dark:bg-orange-500/5",
      divider: "from-transparent via-orange-500/30 to-transparent dark:via-orange-400/35",
      closeButton:
        "border-orange-300/35 bg-orange-100/75 text-orange-700 hover:bg-orange-100 dark:border-orange-400/25 dark:bg-orange-500/20 dark:text-orange-100 dark:hover:bg-orange-500/30",
    },
  },
  [LIBRARY_SHELVES.HIDDEN_GEMS]: {
    keyPrefix: "hidden-gem",
    rowKey: "hiddenGems",
    icon: SparklesIcon,
    rail: {
      iconClassName: "h-5 w-5 text-purple-500",
      accentClassName:
        "flex h-8 w-1.5 items-center justify-center rounded-full bg-gradient-to-b from-purple-500 to-indigo-500",
      containerClassName: "rounded-[28px] px-4 py-3",
      gradientFrom: "from-purple-500/5",
      gradientTo: "to-indigo-500/5",
    },
    browse: {
      iconClassName: "h-4 w-4 text-purple-600 dark:text-purple-300",
      glow: "bg-purple-500/10 dark:bg-purple-400/16",
      header:
        "border-purple-300/45 bg-purple-50/65 ring-1 ring-purple-500/10 dark:border-purple-400/25 dark:bg-purple-500/10 dark:ring-purple-400/20",
      surface: "bg-purple-100/80 dark:bg-purple-500/20",
      filters:
        "ring-1 ring-purple-500/10 bg-purple-50/20 dark:ring-purple-400/20 dark:bg-purple-500/5",
      divider: "from-transparent via-purple-500/30 to-transparent dark:via-purple-400/35",
      closeButton:
        "border-purple-300/35 bg-purple-100/75 text-purple-700 hover:bg-purple-100 dark:border-purple-400/25 dark:bg-purple-500/20 dark:text-purple-100 dark:hover:bg-purple-500/30",
    },
  },
} satisfies Record<BrandedLibraryShelf, LibraryShelfTheme>;

export function getLibraryShelfTheme(shelf: LibraryShelf): LibraryShelfTheme | null {
  if (shelf === LIBRARY_SHELVES.ALL) {
    return null;
  }

  return LIBRARY_SHELF_THEMES[shelf];
}
