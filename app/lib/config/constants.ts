export const LOCATIONS = {
  PRAGUE: "Prague",
  ZLIN: "Zlin",
} as const;

export type LocationValue = (typeof LOCATIONS)[keyof typeof LOCATIONS];
