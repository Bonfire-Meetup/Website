import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

export interface EventLocationTheme {
  ctaButton: string;
  color: string;
  iconTint: string;
  metaIcon: string;
  orb: string;
  rail: string;
  speakerDot: string;
  titleGradient: string;
}

export function getEventLocationTheme(location: LocationValue): EventLocationTheme {
  const isPrague = location === LOCATIONS.PRAGUE;

  return isPrague
    ? {
        ctaButton:
          "overflow-hidden border border-rose-300/45 bg-gradient-to-r from-orange-400 via-rose-500 to-red-600 bg-clip-padding text-white shadow-[0_16px_32px_-18px_rgba(225,29,72,0.48)] transition-[border-color,box-shadow,filter] duration-300 hover:border-rose-300/65 hover:shadow-[0_18px_36px_-18px_rgba(220,38,38,0.44)] hover:brightness-103 dark:border-rose-300/22 dark:shadow-[0_12px_26px_-18px_rgba(225,29,72,0.24)] dark:filter-[saturate(0.8)_brightness(0.84)] dark:hover:border-rose-300/30 dark:hover:filter-[saturate(0.88)_brightness(0.9)]",
        color: "#dc2626",
        iconTint: "text-red-600 dark:text-red-400",
        metaIcon: "bg-red-100/80 dark:bg-red-500/10",
        orb: "bg-gradient-to-br from-red-400/25 to-rose-500/15",
        rail: "bg-gradient-to-r from-rose-500 via-orange-500 to-red-500",
        speakerDot: "bg-red-500 dark:bg-red-400",
        titleGradient:
          "from-rose-600 via-red-500 to-orange-500 dark:from-rose-400 dark:via-red-400 dark:to-orange-400",
      }
    : {
        ctaButton:
          "overflow-hidden border border-blue-300/45 bg-gradient-to-r from-sky-500 via-blue-500 to-indigo-600 bg-clip-padding text-white shadow-[0_16px_32px_-18px_rgba(37,99,235,0.5)] transition-[border-color,box-shadow,filter] duration-300 hover:border-blue-300/65 hover:shadow-[0_18px_36px_-18px_rgba(67,56,202,0.42)] hover:brightness-103 dark:border-blue-300/22 dark:shadow-[0_12px_26px_-18px_rgba(37,99,235,0.22)] dark:filter-[saturate(0.78)_brightness(0.82)] dark:hover:border-blue-300/30 dark:hover:filter-[saturate(0.86)_brightness(0.88)]",
        color: "#2563eb",
        iconTint: "text-blue-600 dark:text-blue-400",
        metaIcon: "bg-blue-100/80 dark:bg-blue-500/10",
        orb: "bg-gradient-to-br from-blue-400/25 to-indigo-500/15",
        rail: "bg-gradient-to-r from-blue-500 via-indigo-500 to-blue-600",
        speakerDot: "bg-blue-500 dark:bg-blue-400",
        titleGradient:
          "from-blue-600 via-indigo-500 to-violet-500 dark:from-blue-400 dark:via-indigo-400 dark:to-violet-400",
      };
}
