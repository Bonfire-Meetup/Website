import type { ReactNode } from "react";

import { AccentBar } from "../ui/AccentBar";

import { RailScrollWrapper } from "./RailScrollWrapper";
import { buildRailGradientClasses, DEFAULT_RAIL_CONTAINER_CLASS } from "./rail-style-utils";

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

export function RailServer({
  title,
  children,
  itemCount,
  headerIcon,
  headerAccent,
  containerClassName = DEFAULT_RAIL_CONTAINER_CLASS,
  gradientFrom,
  gradientTo,
  scrollLeftLabel,
  scrollRightLabel,
}: RailServerProps) {
  if (itemCount === 0) {
    return null;
  }

  const gradients = buildRailGradientClasses(gradientFrom, gradientTo, containerClassName);

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
