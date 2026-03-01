import Link from "next/link";

import { ArrowRightIcon } from "@/components/shared/Icons";

interface CtaButton {
  href: string;
  label: string;
}

interface GuideCtaSectionProps {
  title?: string;
  description?: string;
  secondDescription?: string;
  primary: CtaButton;
  secondary: CtaButton;
  variant?: "default" | "rose";
}

export function GuideCtaSection({
  title,
  description,
  secondDescription,
  primary,
  secondary,
  variant = "default",
}: GuideCtaSectionProps) {
  const sectionClassName =
    variant === "rose"
      ? "mt-8 rounded-3xl border border-rose-300/40 bg-gradient-to-br from-white/80 via-rose-50/50 to-white px-5 py-6 sm:px-7 sm:py-7 dark:border-rose-300/20 dark:from-white/8 dark:via-rose-500/10 dark:to-white/5"
      : "to-brand-100/30 dark:to-brand-500/10 mt-8 rounded-3xl border border-neutral-200/80 bg-gradient-to-br from-white/85 via-white/65 px-5 py-6 sm:px-7 sm:py-7 dark:border-white/10 dark:from-white/8 dark:via-white/5";

  return (
    <section className={sectionClassName}>
      {title ? (
        <h2 className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
          {title}
        </h2>
      ) : null}
      {description ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {description}
        </p>
      ) : null}
      {secondDescription ? (
        <p className="mt-3 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
          {secondDescription}
        </p>
      ) : null}
      <div
        className={`flex flex-wrap gap-3 ${title || description || secondDescription ? "mt-5" : "mt-1"}`}
      >
        <Link
          href={primary.href}
          className="bg-brand-600 hover:bg-brand-500 focus-visible:ring-brand-400 inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-semibold text-white transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none dark:focus-visible:ring-offset-neutral-950"
        >
          {primary.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
        <Link
          href={secondary.href}
          className="inline-flex items-center gap-1.5 rounded-full border border-neutral-300 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:ring-2 focus-visible:ring-neutral-300 focus-visible:ring-offset-2 focus-visible:outline-none dark:border-white/20 dark:bg-white/5 dark:text-white dark:hover:bg-white/10 dark:focus-visible:ring-white/30 dark:focus-visible:ring-offset-neutral-950"
        >
          {secondary.label}
          <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
        </Link>
      </div>
    </section>
  );
}
