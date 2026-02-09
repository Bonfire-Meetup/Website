export const BOOST_TIERS = {
  SPARK: {
    min: 1,
    max: 4,
    titleKey: "spark",
    gradient: "from-emerald-400 to-emerald-600",
  },
  EMBER: {
    min: 5,
    max: 9,
    titleKey: "ember",
    gradient: "from-emerald-500 to-green-600",
  },
  FLAME: {
    min: 10,
    max: 19,
    titleKey: "flame",
    gradient: "from-emerald-500 via-green-500 to-emerald-600",
  },
  BLAZE: {
    min: 20,
    max: 49,
    titleKey: "blaze",
    gradient: "from-emerald-500 via-orange-500 to-emerald-600",
  },
  INFERNO: {
    min: 50,
    max: Infinity,
    titleKey: "inferno",
    gradient: "from-emerald-400 via-orange-400 to-rose-500",
  },
} as const;

export const BOOST_MILESTONES = [1, 5, 10, 25, 50] as const;

export function getBoostTier(count: number): (typeof BOOST_TIERS)[keyof typeof BOOST_TIERS] | null {
  if (count === 0) {
    return null;
  }

  for (const tier of Object.values(BOOST_TIERS)) {
    if (count >= tier.min && count <= tier.max) {
      return tier;
    }
  }

  return BOOST_TIERS.INFERNO;
}

export function getUnlockedMilestones(count: number): number[] {
  return BOOST_MILESTONES.filter((milestone) => count >= milestone);
}
