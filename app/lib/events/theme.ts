import { LOCATIONS, type LocationValue } from "@/lib/config/constants";

export interface EventLocationTheme {
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
