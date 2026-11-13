/**
 * Shared card surface for the speaker and community profile pages, so both sit
 * in the site's glass style. Each page adds its own tone on top.
 */
export const PROFILE_SURFACE = "glass-card rounded-2xl border bg-white/80 dark:bg-neutral-950/70";

export const PROFILE_TONE = {
  community: "border-black/5 dark:border-white/10",
  speaker: "border-orange-500/15 dark:border-orange-400/15",
} as const;

export const PROFILE_EYEBROW = "text-xs font-semibold tracking-[0.25em] uppercase";
