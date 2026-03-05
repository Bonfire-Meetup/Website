export const HERO_WORD_SIZE_CLASS = {
  lg: "text-[18vw] sm:text-[13vw]",
  md: "text-[15vw] sm:text-[11vw]",
  sm: "text-[14vw] sm:text-[10vw]",
  xxl: "text-[20vw] sm:text-[18vw]",
  xl: "text-[22vw] sm:text-[15vw]",
  xs: "text-[12vw] sm:text-[9vw]",
} as const;

export type HeroWordSize = keyof typeof HERO_WORD_SIZE_CLASS;

export const HERO_SECTION_CLASS = {
  compact: "relative px-4 pt-28 pb-10 text-center sm:pt-32 sm:pb-12",
  default:
    "relative flex min-h-[56vh] items-center justify-center overflow-hidden px-4 pt-28 pb-10 sm:min-h-[60vh] sm:pt-32 sm:pb-12",
  inline: "relative mb-10 text-center sm:mb-12",
  detail: "relative mb-16 text-center",
} as const;

export type HeroSectionPreset = keyof typeof HERO_SECTION_CLASS;
