"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useState } from "react";

import { BoltIcon, FilmIcon, GuildIcon, SparklesIcon, UsersIcon } from "@/components/shared/Icons";

function GuildEmber({ style, visible }: { style: CSSProperties; visible: boolean }) {
  return (
    <div
      className="animate-rise absolute rounded-full bg-gradient-to-t from-amber-600 via-orange-500 to-rose-500 shadow-[0_0_8px_rgba(249,115,22,0.6)] dark:from-amber-400 dark:via-orange-400 dark:to-rose-400 dark:shadow-[0_0_10px_rgba(251,146,60,0.7)]"
      style={{
        ...style,
        opacity: visible ? (style.opacity as number) : 0,
        transition: "opacity 1.5s ease-in",
      }}
    />
  );
}

function generateGuildEmbers() {
  return Array.from({ length: 14 }).map(() => ({
    animationDelay: `${Math.random() * -20}s`,
    animationDuration: `${Math.random() * 10 + 10}s`,
    height: `${Math.random() * 6 + 3}px`,
    left: `${Math.random() * 100}%`,
    opacity: Math.random() * 0.4 + 0.55,
    width: `${Math.random() * 6 + 3}px`,
  }));
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function StarIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

function TierCard({
  tier,
}: {
  tier: {
    name: string;
    tagline: string;
    features: string[];
    accent: string;
    glow: string;
    gradient: string;
    border: string;
    iconBg: string;
    badge: string;
    badgeText: string;
  };
}) {
  return (
    <div className={`relative flex flex-col overflow-hidden rounded-3xl border ${tier.border}`}>
      <div className={`relative h-full ${tier.gradient} p-px`}>
        <div className="relative flex h-full flex-col rounded-[23px] bg-white/95 p-6 backdrop-blur-xl sm:p-8 dark:bg-neutral-950/95">
          <div
            className={`pointer-events-none absolute -top-20 -right-20 h-60 w-60 rounded-full ${tier.glow} blur-3xl`}
          />
          <div
            className={`pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full ${tier.glow} opacity-50 blur-3xl`}
          />

          <div className="relative">
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-bold tracking-wider uppercase ${tier.badge}`}
              >
                <StarIcon className="h-3 w-3" />
                {tier.badgeText}
              </span>
            </div>

            <div className="mb-1">
              <h3 className={`text-2xl font-black tracking-tight sm:text-3xl ${tier.accent}`}>
                {tier.name}
              </h3>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
              {tier.tagline}
            </p>

            <div className="mb-6 h-px w-full bg-gradient-to-r from-transparent via-neutral-200 to-transparent dark:via-neutral-800" />

            <ul className="flex-1 space-y-3">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tier.iconBg}`}
                  >
                    <CheckIcon className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-sm leading-relaxed text-neutral-700 dark:text-neutral-300">
                    {feature}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const PERK_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  film: FilmIcon,
  sparkles: SparklesIcon,
  bolt: BoltIcon,
  users: UsersIcon,
};

const PERK_STYLES = [
  {
    iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
    glow: "from-rose-500/15 to-red-500/10",
    accent: "border-rose-200/50 dark:border-rose-500/15",
  },
  {
    iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
    glow: "from-amber-500/15 to-orange-500/10",
    accent: "border-amber-200/50 dark:border-amber-500/15",
  },
  {
    iconBg: "bg-gradient-to-br from-violet-500 to-purple-600",
    glow: "from-violet-500/15 to-purple-500/10",
    accent: "border-violet-200/50 dark:border-violet-500/15",
  },
  {
    iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
    glow: "from-emerald-500/15 to-teal-500/10",
    accent: "border-emerald-200/50 dark:border-emerald-500/15",
  },
];

function PerkCard({
  item,
  index,
}: {
  item: { title: string; description: string; icon: string };
  index: number;
}) {
  const Icon = PERK_ICON_MAP[item.icon] ?? SparklesIcon;
  const style = PERK_STYLES[index % PERK_STYLES.length] ?? PERK_STYLES[0];

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-white/90 p-6 shadow-sm backdrop-blur-sm sm:p-7 dark:bg-white/[0.04] ${style.accent}`}
    >
      <div
        className={`pointer-events-none absolute -top-16 -right-16 h-40 w-40 rounded-full bg-gradient-to-br ${style.glow} blur-3xl`}
      />
      <div
        className={`pointer-events-none absolute -bottom-12 -left-12 h-32 w-32 rounded-full bg-gradient-to-tr ${style.glow} opacity-50 blur-3xl`}
      />

      <div className="relative">
        <div
          className={`mb-5 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${style.iconBg} shadow-lg`}
        >
          <Icon className="h-6 w-6 text-white" />
        </div>

        <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {item.title}
        </h3>

        <p className="text-sm leading-relaxed text-neutral-500 dark:text-neutral-400">
          {item.description}
        </p>
      </div>
    </div>
  );
}

export function GuildPageContent() {
  const t = useTranslations("guildPage");
  const [embers, setEmbers] = useState<CSSProperties[]>([]);
  const [embersVisible, setEmbersVisible] = useState(false);

  useEffect(() => {
    setEmbers(generateGuildEmbers());
    const timer = setTimeout(() => setEmbersVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const tiers = [
    {
      name: t("tiers.scout.name"),
      tagline: t("tiers.scout.tagline"),
      features: t.raw("tiers.scout.features") as string[],
      accent: "text-emerald-600 dark:text-emerald-400",
      glow: "bg-emerald-500/10 dark:bg-emerald-500/5",
      gradient:
        "bg-gradient-to-br from-emerald-200/60 via-transparent to-teal-200/40 dark:from-emerald-500/20 dark:to-teal-500/10",
      border: "border-emerald-200/60 dark:border-emerald-500/20",
      iconBg: "bg-gradient-to-br from-emerald-500 to-teal-600",
      badge:
        "border border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300",
      badgeText: t("tiers.scout.badge"),
    },
    {
      name: t("tiers.explorer.name"),
      tagline: t("tiers.explorer.tagline"),
      features: t.raw("tiers.explorer.features") as string[],
      accent: "text-amber-600 dark:text-amber-400",
      glow: "bg-amber-500/10 dark:bg-amber-500/5",
      gradient:
        "bg-gradient-to-br from-amber-200/60 via-transparent to-orange-200/40 dark:from-amber-500/20 dark:to-orange-500/10",
      border: "border-amber-200/60 dark:border-amber-500/20",
      iconBg: "bg-gradient-to-br from-amber-500 to-orange-600",
      badge:
        "border border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-300",
      badgeText: t("tiers.explorer.badge"),
    },
    {
      name: t("tiers.trailblazer.name"),
      tagline: t("tiers.trailblazer.tagline"),
      features: t.raw("tiers.trailblazer.features") as string[],
      accent: "text-rose-600 dark:text-rose-400",
      glow: "bg-rose-500/10 dark:bg-rose-500/5",
      gradient:
        "bg-gradient-to-br from-rose-200/60 via-transparent to-red-200/40 dark:from-rose-500/20 dark:to-red-500/10",
      border: "border-rose-200/60 dark:border-rose-500/20",
      iconBg: "bg-gradient-to-br from-rose-500 to-red-600",
      badge:
        "border border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300",
      badgeText: t("tiers.trailblazer.badge"),
    },
  ];

  return (
    <div className="relative overflow-hidden">
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-24 pb-20 sm:pt-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(220,38,38,0.08),transparent_70%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_30%,rgba(220,38,38,0.04),transparent_70%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.06),transparent_50%)] dark:bg-[radial-gradient(circle_at_80%_20%,rgba(244,63,94,0.03),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.05),transparent_50%)] dark:bg-[radial-gradient(circle_at_20%_80%,rgba(245,158,11,0.03),transparent_50%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_50%,rgba(0,0,0,0.03)_100%)] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_45%,rgba(0,0,0,0.12)_100%)]" />

        <div className="guild-hero-enter pointer-events-none absolute top-[34%] left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none sm:top-[38%]">
          <div className="guild-icon-breathe relative h-[70vw] w-[70vw] sm:h-[50vw] sm:w-[50vw] md:h-[40vw] md:w-[40vw]">
            <GuildIcon className="h-full w-full text-red-500/10 dark:text-red-400/[0.08]" />

            <div className="guild-icon-breathe-glow absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.12)_0%,rgba(244,63,94,0.06)_40%,transparent_70%)] mix-blend-screen dark:bg-[radial-gradient(circle,rgba(249,115,22,0.08)_0%,rgba(244,63,94,0.04)_40%,transparent_70%)]" />
          </div>
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="guild-ring-1 h-[400px] w-[400px] rounded-full border border-red-500/15 sm:h-[600px] sm:w-[600px] dark:border-red-500/10" />
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="guild-ring-2 h-[550px] w-[550px] rounded-full border border-rose-500/10 sm:h-[800px] sm:w-[800px] dark:border-rose-500/5" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-5xl text-center">
          <p
            className="guild-hero-enter mb-4 text-xs font-bold tracking-[0.4em] text-red-600/80 uppercase sm:text-sm sm:tracking-[0.5em] dark:text-red-400/80"
            style={{ animationDelay: "100ms" }}
          >
            {t("kicker")}
          </p>

          <h1
            className="guild-hero-enter mb-6 text-4xl font-black tracking-tight drop-shadow-[0_1px_2px_rgba(0,0,0,0.04)] sm:mb-8 sm:text-6xl md:text-7xl lg:text-8xl dark:drop-shadow-[0_2px_8px_rgba(0,0,0,0.25)]"
            style={{ animationDelay: "200ms" }}
          >
            <span className="text-neutral-900 dark:text-white">{t("title.part1")} </span>
            <span className="guild-title-gradient inline-block bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent dark:from-red-400 dark:via-rose-400 dark:to-amber-400">
              {t("title.highlight")}
            </span>
          </h1>

          <p
            className="guild-hero-enter mx-auto mb-10 max-w-2xl text-base leading-relaxed text-neutral-600 sm:mb-14 sm:text-lg md:text-xl dark:text-neutral-400"
            style={{ animationDelay: "300ms" }}
          >
            {t("subtitle")}
          </p>

          <div
            className="guild-hero-enter inline-flex items-center gap-3 rounded-full border border-red-200/50 bg-white/90 px-5 py-2.5 shadow-[0_0_24px_-4px_rgba(244,63,94,0.12),0_4px_14px_-2px_rgba(0,0,0,0.06)] backdrop-blur-md dark:border-red-500/25 dark:bg-white/10 dark:shadow-[0_0_32px_-4px_rgba(244,63,94,0.2),0_4px_14px_-2px_rgba(0,0,0,0.2)]"
            style={{ animationDelay: "400ms" }}
          >
            <span className="guild-status-dot relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500" />
            </span>
            <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
              {t("comingSoon")}
            </span>
          </div>
        </div>

        <div className="guild-fireplace">
          <div className="guild-flame guild-flame-4" />
          <div className="guild-flame guild-flame-2" />
          <div className="guild-flame guild-flame-1" />
          <div className="guild-flame guild-flame-3" />
          <div className="guild-flame guild-flame-5" />
          <div className="guild-flame guild-flame-core" />
          <div className="guild-flame-tongue guild-flame-tongue-1" />
          <div className="guild-flame-tongue guild-flame-tongue-2" />
          <div className="guild-flame-tongue guild-flame-tongue-3" />
        </div>

        <div className="pointer-events-none absolute inset-0 z-[1] overflow-hidden" aria-hidden>
          {embers.map((style, i) => (
            <GuildEmber key={`guild-ember-${i}`} style={style} visible={embersVisible} />
          ))}
        </div>

        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-[2] h-40 bg-gradient-to-t from-neutral-50 via-neutral-50/80 to-transparent dark:from-neutral-950 dark:via-neutral-950/90" />
      </section>

      <section className="relative px-4 pt-16 pb-16 sm:pt-24 sm:pb-20">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(220,38,38,0.04),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(220,38,38,0.02),transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-red-600/70 uppercase sm:text-sm dark:text-red-400/70">
              {t("tiersSection.kicker")}
            </p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-white">
              {t("tiersSection.title")}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-relaxed text-neutral-500 sm:text-base dark:text-neutral-400">
              {t("tiersSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
            {tiers.map((tier) => (
              <TierCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-16 sm:py-20">
        <div className="relative mx-auto max-w-2xl">
          <article className="group relative overflow-hidden rounded-2xl border border-neutral-200/80 bg-gradient-to-br from-[#fafaf9] via-white to-[#fafaf9] px-8 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.9)] sm:px-10 sm:py-10 dark:border-neutral-700/50 dark:from-neutral-900 dark:via-neutral-900/95 dark:to-neutral-900 dark:shadow-[0_8px_32px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.2)]">
            <div className="absolute top-0 right-0 h-12 w-12 overflow-hidden rounded-tr-2xl">
              <div
                className="absolute top-0 right-0 h-full w-full bg-gradient-to-br from-red-500/10 to-transparent dark:from-red-400/8"
                style={{ clipPath: "polygon(100% 0, 100% 100%, 0 0)" }}
              />
            </div>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_100%_0%,rgba(244,63,94,0.04),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(245,158,11,0.02),transparent_50%)] dark:bg-[radial-gradient(circle_at_100%_0%,rgba(244,63,94,0.02),transparent_50%),radial-gradient(circle_at_0%_100%,rgba(245,158,11,0.01),transparent_50%)]" />
            <div className="absolute inset-0 rounded-2xl ring-1 ring-red-500/5 ring-inset dark:ring-red-400/5" />
            <div className="relative border-t-2 border-red-500/25 pt-6 dark:border-red-400/20">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-red-500/40 dark:bg-red-400/30" />
                <p className="text-[10px] font-bold tracking-[0.25em] text-red-600/70 uppercase dark:text-red-400/60">
                  {t("openNoteLabel")}
                </p>
              </div>
              <p className="text-lg leading-[1.75] text-neutral-800 sm:text-[1.0625rem] sm:leading-[1.8] dark:text-neutral-100">
                {t.rich("openNote", {
                  bold: (chunks) => (
                    <strong className="font-semibold text-neutral-900 dark:text-white">
                      {chunks}
                    </strong>
                  ),
                })}
              </p>
            </div>
          </article>
        </div>
      </section>

      <section className="relative px-4 pt-16 pb-16 sm:pt-20 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.04),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.02),transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-14 text-center sm:mb-20">
            <p className="mb-3 text-xs font-bold tracking-[0.3em] text-red-600/70 uppercase sm:text-sm dark:text-red-400/70">
              {t("perksSection.kicker")}
            </p>
            <h2 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl md:text-5xl dark:text-white">
              {t("perksSection.title")}
            </h2>
            <p className="mx-auto max-w-2xl text-sm leading-relaxed text-neutral-500 sm:text-base dark:text-neutral-400">
              {t("perksSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {(
              t.raw("perksSection.items") as { title: string; description: string; icon: string }[]
            ).map((item, i) => (
              <PerkCard key={item.title} item={item} index={i} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-16 sm:py-24">
        <div className="relative mx-auto max-w-3xl text-center">
          <div className="guild-cta-card relative overflow-hidden rounded-3xl border border-red-200/40 bg-gradient-to-br from-red-50/80 via-white to-rose-50/60 p-8 shadow-2xl shadow-red-500/5 sm:p-12 dark:border-red-500/15 dark:from-red-950/40 dark:via-neutral-950 dark:to-rose-950/30 dark:shadow-red-500/10">
            <div className="pointer-events-none absolute -top-12 -right-12 h-48 w-48 rounded-full bg-gradient-to-br from-red-400/15 via-rose-300/10 to-transparent blur-3xl dark:from-red-500/10" />
            <div className="pointer-events-none absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-gradient-to-tr from-amber-400/10 via-rose-300/10 to-transparent blur-3xl dark:from-amber-500/5" />

            <div className="relative">
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-red-500 to-rose-600 shadow-lg shadow-red-500/30">
                <GuildIcon className="h-7 w-7 text-white" />
              </div>
              <h2 className="mb-4 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {t("cta.title")}
              </h2>
              <p className="mx-auto mb-8 max-w-lg text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
                {t("cta.body")}
              </p>
              <div className="inline-flex items-center gap-3 rounded-full border border-red-200/60 bg-white/80 px-5 py-2.5 shadow-md backdrop-blur-sm dark:border-red-500/20 dark:bg-white/5">
                <span className="inline-flex h-2 w-2 rounded-full bg-red-500" />
                <span className="text-sm font-semibold text-neutral-700 dark:text-neutral-200">
                  {t("cta.badge")}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
