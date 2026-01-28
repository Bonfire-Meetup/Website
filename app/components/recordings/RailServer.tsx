import type { ReactNode } from "react";

import { AccentBar } from "../ui/AccentBar";

import { RailScrollWrapper } from "./RailScrollWrapper";

interface RailServerProps {
  title: string;
  children: ReactNode;
  itemCount: number;
  headerIcon?: ReactNode;
  headerAccent?: ReactNode;
  containerClassName?: string;
  gradientFrom?: string;
  gradientTo?: string;
  scrollLeftLabel: string;
  scrollRightLabel: string;
}

function getGradientClasses(
  gradientFrom?: string,
  gradientTo?: string,
  containerClassName = "rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60",
) {
  if (!gradientFrom || !gradientTo) {
    return {
      container: containerClassName,
      left: null,
      right: null,
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

export function RailServer({
  title,
  children,
  itemCount,
  headerIcon,
  headerAccent,
  containerClassName = "rounded-[28px] bg-white/60 px-2 pt-2 pb-2 dark:bg-neutral-950/60",
  gradientFrom,
  gradientTo,
  scrollLeftLabel,
  scrollRightLabel,
}: RailServerProps) {
  if (itemCount === 0) {
    return null;
  }

  const gradients = getGradientClasses(gradientFrom, gradientTo, containerClassName);

  const headerContent = (
    <div className="flex items-center gap-3">
      {headerAccent || <AccentBar />}
      <h3 className="text-lg font-semibold tracking-tight text-neutral-900 sm:text-xl dark:text-white">
        {title}
      </h3>
      {headerIcon}
    </div>
  );

  return (
    <RailScrollWrapper
      headerContent={headerContent}
      itemCount={itemCount}
      containerClassName={gradients.container}
      gradientLeft={gradients.left}
      gradientRight={gradients.right}
      scrollLeftLabel={scrollLeftLabel}
      scrollRightLabel={scrollRightLabel}
    >
      {children}
    </RailScrollWrapper>
  );
}
