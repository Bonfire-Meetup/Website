import type { ComponentType, ReactNode } from "react";

interface GuideSectionProps {
  title: string;
  icon?: ComponentType<{ className?: string; "aria-hidden"?: "true" }>;
  children: ReactNode;
}

export function GuideSection({ title, icon: Icon, children }: GuideSectionProps) {
  return (
    <article className="px-5 py-7 sm:px-7 sm:py-8">
      <h2
        className={`mb-4 text-2xl font-black tracking-tight text-neutral-900 dark:text-white ${Icon ? "flex items-center gap-2" : ""}`}
      >
        {Icon ? (
          <Icon className="text-brand-600 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
        ) : null}
        {title}
      </h2>
      {children}
    </article>
  );
}
