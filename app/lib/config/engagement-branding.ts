export const ENGAGEMENT_BRANDING = {
  like: {
    icon: "FireIcon",
    colors: {
      gradientFrom: "orange-500",
      gradientTo: "rose-500",
      inactive: "rose-400",
      inactiveDark: "rose-300",
      shadow: "orange-500",
      railLight: "rose-500/5",
      railDark: "rose-500/10",
      railLightSecondary: "orange-500/5",
      railDarkSecondary: "orange-500/10",
    },
    classes: {
      activeGradient: "bg-gradient-to-r from-orange-500 to-rose-500",
      activeShadow: "shadow-lg shadow-orange-500/50",
      activeText: "text-white",
      inactiveText: "text-rose-400 dark:text-rose-300",
      hoverShadow: "hover:shadow-rose-500/30",
    },
    animations: {
      pop: "like-pop",
      glow: "like-glow",
    },
    i18nKeys: {
      title: "spark",
      action: "lightItUp",
    },
  },

  boost: {
    icon: "BoltIcon",
    colors: {
      gradientFrom: "emerald-500",
      gradientTo: "teal-500",
      inactive: "emerald-600",
      inactiveDark: "emerald-400",
      shadow: "emerald-500",
      railLight: "emerald-500/5",
      railDark: "emerald-500/10",
      railLightSecondary: "teal-500/5",
      railDarkSecondary: "teal-500/10",
    },
    classes: {
      activeGradient: "bg-gradient-to-r from-emerald-500 to-teal-500",
      activeShadow: "shadow-lg shadow-emerald-500/60",
      activeText: "text-white",
      inactiveText: "text-emerald-600 dark:text-emerald-400",
      hoverShadow: "hover:shadow-emerald-500/40",
    },
    animations: {
      pop: "boost-pop",
      glow: "boost-glow",
    },
    i18nKeys: {
      title: "boost",
      action: "boostItUp",
      noBoostsAvailable: "boostNoBoostsAvailable",
      hint: "boostHint",
    },
  },

  rateLimitError: {
    colors: {
      borderLight: "amber-200",
      borderDark: "amber-500/30",
      bgLight: "amber-50",
      bgDark: "amber-500/10",
      textLight: "amber-800",
      textDark: "amber-200",
    },
    classes: {
      container:
        "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200",
    },
  },

  guild: {
    icon: "GuildIcon",
    colors: {
      base: "red",
      accent: "rose",
      primary: "red-600",
      primaryDark: "red-300",
      secondary: "red-500",
      secondaryDark: "red-400",
      accentLight: "rose-300",
      accentDark: "rose-500",
    },
    classes: {
      card: "group relative overflow-hidden rounded-3xl border border-red-300/60 bg-gradient-to-br from-red-50/60 via-white to-red-100/70 shadow-xl shadow-red-500/10 dark:border-red-500/20 dark:from-neutral-900 dark:via-neutral-900/95 dark:to-red-950/30 dark:shadow-red-500/10",
      cardHover:
        "hover:border-red-500/30 dark:hover:border-red-500/20 hover:bg-white dark:hover:bg-white/10",
      titleHover: "group-hover:text-red-600 dark:group-hover:text-red-400",
      badge:
        "inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200",
      infoBox:
        "rounded-2xl border border-red-200/60 bg-red-50/70 px-4 py-3 text-sm text-red-700 dark:border-red-500/20 dark:bg-red-500/10 dark:text-red-200",
      infoBoxTitle: "font-semibold text-red-900 dark:text-red-100",
      blurTopRight:
        "absolute -top-8 -right-8 h-40 w-40 rounded-full bg-gradient-to-br from-red-400/30 via-rose-300/25 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-red-500/15 dark:via-rose-500/10",
      blurBottomLeft:
        "absolute -bottom-6 -left-6 h-32 w-32 rounded-full bg-gradient-to-tr from-red-300/30 via-rose-200/25 to-transparent blur-2xl transition-all duration-500 group-hover:scale-110 dark:from-red-500/10 dark:via-rose-500/10",
      iconContainer:
        "absolute top-6 right-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-red-200 to-rose-200 shadow-md shadow-red-500/20 dark:from-red-500/20 dark:to-rose-500/20 dark:shadow-inner",
      icon: "h-6 w-6 text-red-600 dark:text-red-300",
      kicker:
        "text-[10px] font-bold tracking-[0.3em] text-red-600/90 uppercase dark:text-red-300/90",
      soonBadge:
        "rounded-full bg-red-200 px-2 py-0.5 text-[9px] font-bold tracking-wider text-red-800 uppercase dark:bg-red-500/20 dark:text-red-200",
      checkmark: "h-4 w-4 shrink-0 text-red-500 dark:text-red-400",
    },
  },
} as const;

export function getLikeButtonClasses(isActive: boolean, isPending: boolean, isDisabled: boolean) {
  const { like } = ENGAGEMENT_BRANDING;
  const baseClasses =
    "relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-l-full border border-r-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-all dark:border-white/10";
  const stateClasses = isActive
    ? `${like.classes.activeGradient} ${like.classes.activeShadow} ${like.classes.activeText}`
    : `bg-white ${like.classes.inactiveText} dark:bg-white/5`;
  const opacityClass = isPending ? "opacity-80" : "";
  const cursorClass = isDisabled
    ? "cursor-not-allowed"
    : `cursor-pointer ${like.classes.hoverShadow}`;

  return `${baseClasses} ${stateClasses} ${opacityClass} ${cursorClass}`;
}

export function getBoostButtonClasses(isActive: boolean, isPending: boolean, isDisabled: boolean) {
  const { boost } = ENGAGEMENT_BRANDING;
  const baseClasses =
    "relative inline-flex h-11 min-w-[8.5rem] items-center justify-center gap-3 rounded-r-full border border-l-0 border-neutral-200/60 px-5 py-2.5 text-sm leading-none font-semibold transition-all dark:border-white/10";
  const stateClasses = isActive
    ? `${boost.classes.activeGradient} ${boost.classes.activeShadow} ${boost.classes.activeText}`
    : `bg-white ${boost.classes.inactiveText} dark:bg-white/5`;
  const opacityClass = isPending ? "opacity-80" : "";
  const cursorClass = isDisabled
    ? "cursor-not-allowed"
    : `cursor-pointer ${boost.classes.hoverShadow}`;

  return `${baseClasses} ${stateClasses} ${opacityClass} ${cursorClass}`;
}
