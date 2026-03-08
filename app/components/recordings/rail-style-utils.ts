export const DEFAULT_RAIL_CONTAINER_CLASS =
  "rounded-[28px] bg-white/60 px-5 py-3 dark:bg-neutral-950/60";

export function buildRailGradientClasses(
  gradientFrom?: string,
  gradientTo?: string,
  containerClassName = DEFAULT_RAIL_CONTAINER_CLASS,
) {
  if (!gradientFrom || !gradientTo) {
    return {
      container: containerClassName,
      left: null as string | null,
      right: null as string | null,
    };
  }

  const isRose = gradientFrom.includes("rose");
  const isEmerald = gradientFrom.includes("emerald");
  const isPurple = gradientFrom.includes("purple");
  const isRed = gradientFrom.includes("red");
  let ringClass = "";
  if (isRose) {
    ringClass = "ring-rose-500/10 dark:ring-rose-400/20";
  } else if (isEmerald) {
    ringClass = "ring-emerald-500/10 dark:ring-emerald-400/20";
  } else if (isPurple) {
    ringClass = "ring-purple-500/10 dark:ring-purple-400/20";
  } else if (isRed) {
    ringClass = "ring-red-500/10 dark:ring-red-400/20";
  }

  let leftGradient: string | null = null;
  if (isRose) {
    leftGradient = "from-rose-500/5 to-transparent dark:from-rose-500/10";
  } else if (isEmerald) {
    leftGradient = "from-emerald-500/5 to-transparent dark:from-emerald-500/10";
  } else if (isPurple) {
    leftGradient = "from-purple-500/5 to-transparent dark:from-purple-500/10";
  } else if (isRed) {
    leftGradient = "from-red-500/5 to-transparent dark:from-red-500/10";
  }

  let rightGradient: string | null = null;
  if (gradientTo.includes("orange")) {
    rightGradient = "from-orange-500/5 to-transparent dark:from-orange-500/10";
  } else if (gradientTo.includes("teal")) {
    rightGradient = "from-teal-500/5 to-transparent dark:from-teal-500/10";
  } else if (gradientTo.includes("indigo")) {
    rightGradient = "from-indigo-500/5 to-transparent dark:from-indigo-500/10";
  }

  return {
    container: `relative ${containerClassName} bg-gradient-to-r ${gradientFrom} ${gradientTo} ring-1 ${ringClass}`,
    left: leftGradient,
    right: rightGradient,
  };
}
