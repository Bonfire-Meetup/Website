import type { ReactNode } from "react";

export type GuideStepVariant = "numbered" | "bullet" | "dot" | "rose-dot" | "emerald-dot";

interface GuideStepListProps {
  items: ReactNode[];
  size?: "md" | "sm";
  variant?: GuideStepVariant;
}

const DOT_COLOR_CLASS: Record<GuideStepVariant, string> = {
  bullet: "bg-brand-500 dark:bg-brand-300",
  dot: "bg-brand-500 dark:bg-brand-300",
  "emerald-dot": "bg-emerald-500 dark:bg-emerald-300",
  numbered: "bg-brand-500 dark:bg-brand-300",
  "rose-dot": "bg-rose-500 dark:bg-rose-300",
};

const BADGE_CLASS =
  "border-brand-300/40 text-brand-700 dark:border-brand-300/25 dark:text-brand-300 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs font-semibold";

function StepMarker({ index, variant }: { index: number; variant: GuideStepVariant }) {
  if (variant === "numbered" || variant === "bullet") {
    return <span className={BADGE_CLASS}>{variant === "numbered" ? index + 1 : "•"}</span>;
  }

  if (variant === "dot") {
    return <span className={`${DOT_COLOR_CLASS.dot} mt-1.5 h-2 w-2 shrink-0 rounded-full`} />;
  }

  return <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${DOT_COLOR_CLASS[variant]}`} />;
}

export function GuideStepList({ items, size = "md", variant = "numbered" }: GuideStepListProps) {
  const isSmall = size === "sm";
  const List = isSmall ? "ul" : "ol";

  return (
    <List className={isSmall ? "mt-3 space-y-2" : "space-y-3"}>
      {items.map((item, index) => (
        <li
          // oxlint-disable-next-line react/no-array-index-key -- static content, never reordered
          key={index}
          className={
            isSmall
              ? "flex gap-2 text-sm leading-relaxed"
              : "flex gap-3 text-sm leading-relaxed sm:text-base"
          }
        >
          {isSmall ? (
            <span
              className={`mt-1 h-1.5 w-1.5 shrink-0 rounded-full ${DOT_COLOR_CLASS[variant]}`}
            />
          ) : (
            <StepMarker index={index} variant={variant} />
          )}
          <span className="text-neutral-700 dark:text-neutral-300">{item}</span>
        </li>
      ))}
    </List>
  );
}
