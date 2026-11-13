import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { GuideCtaSection } from "@/components/guides/GuideCtaSection";
import { GuideSection } from "@/components/guides/GuideSection";
import { ArrowRightIcon } from "@/components/shared/Icons";
import { Pill } from "@/components/ui/Pill";

import { blockChildren, paragraphContents, styleParagraphs } from "./children";
import { GUIDE_ICONS, type GuideIconName } from "./guide-icons";

interface BlockProps {
  children: ReactNode;
}

export function GuideLink({ children, href = "" }: ComponentPropsWithoutRef<"a">) {
  return (
    <Link
      href={href}
      className="font-semibold text-neutral-900 underline decoration-neutral-300 underline-offset-4 transition hover:decoration-neutral-500 dark:text-white dark:decoration-white/20 dark:hover:decoration-white/40"
    >
      {children}
    </Link>
  );
}

/** Plain card surface, for pages that combine several regions in one card. */
export function Surface({ children }: BlockProps) {
  return <div className="surface overflow-hidden">{blockChildren(children)}</div>;
}

/** Stack of `<Section>` blocks separated by divider lines. */
export function SectionList({ children }: BlockProps) {
  return (
    <div className="divide-y divide-neutral-200/80 dark:divide-white/10">
      {blockChildren(children)}
    </div>
  );
}

interface SectionProps extends BlockProps {
  icon?: GuideIconName;
  size?: "md" | "sm";
  title: string;
}

export function Section({ children, icon, size = "md", title }: SectionProps) {
  return (
    <GuideSection title={title} icon={icon ? GUIDE_ICONS[icon] : undefined}>
      {styleParagraphs(children, ({ isLast }) =>
        size === "sm"
          ? "text-sm leading-relaxed text-neutral-700 dark:text-neutral-300"
          : `${isLast ? "" : "mb-3 "}text-neutral-700 dark:text-neutral-300`,
      )}
    </GuideSection>
  );
}

/** List of `<Term>` blocks: a short title with one paragraph of explanation each. */
export function Terms({ children }: BlockProps) {
  return <div className="space-y-5">{blockChildren(children)}</div>;
}

export function Term({ children, title }: BlockProps & { title: string }) {
  return (
    <div>
      <h3 className="text-base font-bold tracking-tight text-neutral-900 dark:text-white">
        {title}
      </h3>
      <p className="mt-1 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {paragraphContents(children)[0]}
      </p>
    </div>
  );
}

const CALLOUT_TONE_CLASS = {
  emerald:
    "mt-5 rounded-2xl border border-emerald-300/45 bg-emerald-100/60 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-400/25 dark:bg-emerald-500/12 dark:text-emerald-100",
  neutral:
    "mt-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/90 px-4 py-3 text-sm text-neutral-700 dark:border-white/10 dark:bg-white/5 dark:text-neutral-300",
  rose: "mt-5 rounded-2xl border border-rose-300/45 bg-rose-100/60 px-4 py-3 text-sm text-rose-900 dark:border-rose-400/25 dark:bg-rose-500/12 dark:text-rose-100",
};

interface CalloutProps extends BlockProps {
  title?: string;
  tone?: keyof typeof CALLOUT_TONE_CLASS;
}

export function Callout({ children, title, tone = "neutral" }: CalloutProps) {
  const [body] = paragraphContents(children);

  return (
    <div className={CALLOUT_TONE_CLASS[tone]}>
      {title ? (
        <>
          <div className="font-semibold">{title}</div>
          <div className="mt-1">{body}</div>
        </>
      ) : (
        body
      )}
    </div>
  );
}

interface InfoPanelProps extends BlockProps {
  icon: GuideIconName;
  title: string;
}

/** Highlighted panel with an icon heading, e.g. a safety note inside a section. */
export function InfoPanel({ children, icon, title }: InfoPanelProps) {
  const Icon = GUIDE_ICONS[icon];

  return (
    <div className="mt-6 rounded-2xl border border-emerald-300/35 bg-emerald-50/70 p-4 dark:border-emerald-300/20 dark:bg-emerald-500/10">
      <h3 className="flex items-center gap-2 text-base font-bold tracking-tight text-neutral-900 dark:text-white">
        <Icon className="h-4 w-4 text-emerald-600 dark:text-emerald-300" />
        {title}
      </h3>
      {styleParagraphs(
        children,
        () => "mt-1.5 text-sm leading-relaxed text-neutral-700 dark:text-neutral-300",
      )}
    </div>
  );
}

/** Vertical timeline of `<TimelineStep>` blocks. */
export function Timeline({ children }: BlockProps) {
  return (
    <ol className="relative space-y-8">
      <div className="from-brand-300/60 via-brand-400/25 dark:from-brand-300/30 dark:via-brand-300/10 absolute top-4 bottom-4 left-[1.35rem] w-px bg-gradient-to-b to-transparent sm:left-[1.45rem]" />
      {blockChildren(children)}
    </ol>
  );
}

interface TimelineStepProps extends BlockProps {
  href?: string;
  icon: GuideIconName;
  label: string;
  linkLabel?: string;
  title: string;
}

export function TimelineStep({ children, href, icon, label, linkLabel, title }: TimelineStepProps) {
  const Icon = GUIDE_ICONS[icon];

  return (
    <li className="relative pl-14 sm:pl-16">
      <div className="surface border-brand-300/45 dark:border-brand-300/20 absolute top-0 left-0 flex h-11 w-11 items-center justify-center">
        <Icon className="text-brand-700 dark:text-brand-300 h-5 w-5" aria-hidden="true" />
      </div>
      <div className="mb-2 flex items-center gap-3">
        <span className="eyebrow text-brand-700 dark:text-brand-300 text-xs">{label}</span>
        <span className="h-px flex-1 bg-neutral-200 dark:bg-white/10" />
      </div>
      <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">{title}</h2>
      <p className="mt-2 text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
        {paragraphContents(children)[0]}
      </p>
      {href && linkLabel ? (
        <div className="mt-3">
          <Link
            href={href}
            className="text-brand-700 hover:text-brand-600 dark:text-brand-300 dark:hover:text-brand-200 inline-flex items-center gap-1.5 text-sm font-semibold transition-colors"
          >
            {linkLabel}
            <ArrowRightIcon className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      ) : null}
    </li>
  );
}

/** Two-column grid of `<StatusCard>` blocks. */
export function CardGrid({ children }: BlockProps) {
  return <div className="grid gap-3 sm:grid-cols-2">{blockChildren(children)}</div>;
}

const STATUS_TONE_CLASS = {
  amber: {
    card: "border-amber-300/40 dark:border-amber-300/20 bg-amber-50/70 dark:bg-amber-500/10",
    icon: "text-amber-600 dark:text-amber-300",
    label: "text-amber-700 dark:text-amber-300",
  },
  blue: {
    card: "border-blue-300/40 dark:border-blue-300/20 bg-blue-50/70 dark:bg-blue-500/10",
    icon: "text-blue-600 dark:text-blue-300",
    label: "text-blue-700 dark:text-blue-300",
  },
  emerald: {
    card: "border-emerald-300/40 dark:border-emerald-300/20 bg-emerald-50/70 dark:bg-emerald-500/10",
    icon: "text-emerald-600 dark:text-emerald-300",
    label: "text-emerald-700 dark:text-emerald-300",
  },
  red: {
    card: "border-red-300/40 dark:border-red-300/20 bg-red-50/70 dark:bg-red-500/10",
    icon: "text-red-600 dark:text-red-300",
    label: "text-red-700 dark:text-red-300",
  },
};

interface StatusCardProps extends BlockProps {
  icon: GuideIconName;
  title: string;
  tone: keyof typeof STATUS_TONE_CLASS;
}

export function StatusCard({ children, icon, title, tone }: StatusCardProps) {
  const Icon = GUIDE_ICONS[icon];
  const toneClass = STATUS_TONE_CLASS[tone];

  return (
    <div className={`rounded-xl border p-3.5 ${toneClass.card}`}>
      <div className="mb-1.5 flex items-center gap-2">
        <Icon className={`h-4 w-4 ${toneClass.icon}`} aria-hidden="true" />
        <span className={`text-sm font-bold ${toneClass.label}`}>{title}</span>
      </div>
      <p className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
        {paragraphContents(children)[0]}
      </p>
    </div>
  );
}

/** Padded two-column grid of `<FeatureCard>` blocks at the top of a `<Surface>`. */
export function FeatureGrid({ children }: BlockProps) {
  return (
    <div className="px-5 py-7 sm:px-7 sm:py-8">
      <section className="grid gap-5 md:grid-cols-2">{blockChildren(children)}</section>
    </div>
  );
}

const FEATURE_TONE_CLASS = {
  emerald: {
    badge:
      "gap-1.5 border border-emerald-300/50 bg-emerald-100 font-semibold text-emerald-700 dark:border-emerald-400/30 dark:bg-emerald-500/15 dark:text-emerald-200",
    card: "rounded-2xl border border-emerald-300/40 bg-gradient-to-br from-emerald-50/80 to-white p-5 dark:border-emerald-400/20 dark:from-emerald-500/10 dark:to-white/5",
    icon: "h-5 w-5 text-emerald-600 dark:text-emerald-300",
  },
  rose: {
    badge:
      "gap-1.5 border border-rose-300/50 bg-rose-100 font-semibold text-rose-700 dark:border-rose-400/30 dark:bg-rose-500/15 dark:text-rose-200",
    card: "rounded-2xl border border-rose-300/40 bg-gradient-to-br from-rose-50/80 to-white p-5 dark:border-rose-400/20 dark:from-rose-500/10 dark:to-white/5",
    icon: "h-5 w-5 text-rose-600 dark:text-rose-300",
  },
};

interface FeatureCardProps extends BlockProps {
  badge: string;
  icon: GuideIconName;
  title: string;
  tone: keyof typeof FEATURE_TONE_CLASS;
}

export function FeatureCard({ badge, children, icon, title, tone }: FeatureCardProps) {
  const Icon = GUIDE_ICONS[icon];
  const toneClass = FEATURE_TONE_CLASS[tone];

  return (
    <article className={toneClass.card}>
      <div className="mb-4 flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          <Icon className={toneClass.icon} aria-hidden="true" />
          {title}
        </h2>
        <Pill size="xxs" className={toneClass.badge}>
          <Icon className="h-3.5 w-3.5" aria-hidden="true" />
          {badge}
        </Pill>
      </div>
      {styleParagraphs(
        children,
        () => "mb-4 text-sm leading-relaxed text-neutral-700 sm:text-base dark:text-neutral-300",
      )}
    </article>
  );
}

interface CtaProps {
  children?: ReactNode;
  primaryHref: string;
  primaryLabel: string;
  secondaryHref: string;
  secondaryLabel: string;
  title?: string;
  variant?: "default" | "rose";
}

/** Closing call to action. Up to two markdown paragraphs become its description. */
export function Cta({
  children,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  title,
  variant,
}: CtaProps) {
  const [description, secondDescription] = paragraphContents(children);

  return (
    <GuideCtaSection
      title={title}
      description={description}
      secondDescription={secondDescription}
      primary={{ href: primaryHref, label: primaryLabel }}
      secondary={{ href: secondaryHref, label: secondaryLabel }}
      variant={variant}
    />
  );
}
