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
