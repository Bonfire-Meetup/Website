import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

export interface PanelTheme {
  blockBorder: string;
  card: string;
  digitGradient: string;
  focusBorder: string;
  icon: string;
  ownBubble: string;
  sendButton: string;
}

export const PANEL_THEMES: Partial<Record<LocationValue, PanelTheme>> = {
  [LOCATIONS.PRAGUE]: {
    blockBorder: "border-rose-200/60 dark:border-white/10",
    card: "border-rose-200/80 bg-gradient-to-br from-rose-50/90 via-red-50/60 to-white shadow-[0_16px_48px_-20px_rgba(244,63,94,0.45)] dark:border-rose-400/20 dark:from-rose-500/12 dark:via-red-500/8 dark:to-white/[0.02]",
    digitGradient: "from-rose-500 to-red-500 dark:from-rose-300 dark:to-red-400",
    focusBorder: "focus:border-rose-300 dark:focus:border-rose-400/50",
    icon: "text-rose-500/70 dark:text-rose-400/70",
    ownBubble:
      "from-rose-500 via-orange-500 to-red-500 shadow-orange-400/25 dark:shadow-orange-500/20",
    sendButton: "from-rose-500 to-red-500 shadow-rose-400/25",
  },
  [LOCATIONS.ZLIN]: {
    blockBorder: "border-blue-200/60 dark:border-white/10",
    card: "border-blue-200/80 bg-gradient-to-br from-blue-50/90 via-indigo-50/60 to-white shadow-[0_16px_48px_-20px_rgba(37,99,235,0.4)] dark:border-blue-400/20 dark:from-blue-500/12 dark:via-indigo-500/8 dark:to-white/[0.02]",
    digitGradient: "from-blue-500 to-indigo-600 dark:from-blue-300 dark:to-indigo-400",
    focusBorder: "focus:border-blue-300 dark:focus:border-blue-400/50",
    icon: "text-blue-500/70 dark:text-blue-400/70",
    ownBubble:
      "from-blue-500 via-indigo-500 to-blue-600 shadow-blue-400/25 dark:shadow-blue-500/20",
    sendButton: "from-blue-500 to-indigo-600 shadow-blue-400/25",
  },
};

export const DEFAULT_PANEL_THEME: PanelTheme = {
  blockBorder: "border-orange-200/60 dark:border-white/10",
  card: "border-orange-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/60 to-white shadow-[0_16px_48px_-20px_rgba(249,115,22,0.5)] dark:border-orange-400/20 dark:from-orange-500/12 dark:via-amber-500/8 dark:to-white/[0.02]",
  digitGradient: "from-orange-500 to-rose-500 dark:from-orange-300 dark:to-rose-400",
  focusBorder: "focus:border-orange-300 dark:focus:border-orange-400/50",
  icon: "text-orange-500/70 dark:text-orange-400/70",
  ownBubble:
    "from-rose-500 via-orange-500 to-red-500 shadow-orange-400/25 dark:shadow-orange-500/20",
  sendButton: "from-rose-500 to-orange-500 shadow-orange-400/25",
};
