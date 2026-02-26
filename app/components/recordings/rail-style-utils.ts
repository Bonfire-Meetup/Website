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
  const ringClass = isRose
    ? "ring-rose-500/10 dark:ring-rose-400/20"
    : isEmerald
      ? "ring-emerald-500/10 dark:ring-emerald-400/20"
      : isPurple
        ? "ring-purple-500/10 dark:ring-purple-400/20"
        : "";
  const leftGradient = isRose
    ? "from-rose-500/5 to-transparent dark:from-rose-500/10"
    : isEmerald
      ? "from-emerald-500/5 to-transparent dark:from-emerald-500/10"
      : isPurple
        ? "from-purple-500/5 to-transparent dark:from-purple-500/10"
        : null;
  const rightGradient = gradientTo.includes("orange")
    ? "from-orange-500/5 to-transparent dark:from-orange-500/10"
    : gradientTo.includes("teal")
      ? "from-teal-500/5 to-transparent dark:from-teal-500/10"
      : gradientTo.includes("indigo")
        ? "from-indigo-500/5 to-transparent dark:from-indigo-500/10"
        : null;

  return {
    container: `relative ${containerClassName} bg-gradient-to-r ${gradientFrom} ${gradientTo} ring-1 ${ringClass}`,
    left: leftGradient,
    right: rightGradient,
  };
}
