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
    <div
      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${tier.border} bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-shadow duration-300 hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:bg-neutral-950/80 dark:shadow-none dark:hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)]`}
    >
      <div className={`relative h-full ${tier.gradient} p-px`}>
        <div className="relative flex h-full flex-col rounded-[15px] bg-white/95 p-6 backdrop-blur-sm sm:p-7 dark:bg-neutral-950/95">
          <div
            className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full ${tier.glow} opacity-80 blur-3xl`}
          />
          <div
            className={`pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full ${tier.glow} opacity-40 blur-3xl`}
          />

          <div className="relative">
            <div className="mb-4">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase ${tier.badge}`}
              >
                <StarIcon className="h-2.5 w-2.5" />
                {tier.badgeText}
              </span>
            </div>

            <h3 className={`mb-2 text-xl font-black tracking-tight sm:text-2xl ${tier.accent}`}>
              {tier.name}
            </h3>
            <p className="mb-5 text-sm leading-[1.55] text-neutral-500 dark:text-neutral-400">
              {tier.tagline}
            </p>

            <div className="mb-5 h-px w-full bg-gradient-to-r from-transparent via-neutral-200/80 to-transparent dark:via-neutral-700/60" />

            <ul className="flex-1 space-y-3.5">
              {tier.features.map((feature) => (
                <li key={feature} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tier.iconBg} shadow-sm`}
                  >
                    <CheckIcon className="h-3 w-3 text-white" />
                  </span>
                  <span className="text-sm leading-[1.5] text-neutral-700 dark:text-neutral-300">
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

const PERK_ACCENT = [
  "text-rose-500 dark:text-rose-400",
  "text-amber-500 dark:text-amber-400",
  "text-violet-500 dark:text-violet-400",
  "text-emerald-500 dark:text-emerald-400",
];

function PerkCard({
  item,
  index,
}: {
  item: { title: string; description: string; icon: string };
  index: number;
}) {
  const Icon = PERK_ICON_MAP[item.icon] ?? SparklesIcon;
  const accent = PERK_ACCENT[index % PERK_ACCENT.length] ?? PERK_ACCENT[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/70 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:p-7 dark:border-neutral-800/60 dark:bg-neutral-950/50">
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-50/50 via-transparent to-neutral-100/30 dark:from-neutral-900/30 dark:to-neutral-800/20" />

      <div className="relative flex gap-5">
        {/* Floating icon with soft glow */}
        <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
          <div className={`absolute inset-0 ${accent} opacity-20 blur-xl`}>
            <Icon className="h-full w-full" />
          </div>
          <Icon className={`relative h-5 w-5 ${accent}`} />
        </div>

        <div className="min-w-0 flex-1">
          <h3 className="mb-1.5 text-base font-semibold tracking-tight text-neutral-900 dark:text-white">
            {item.title}
          </h3>
          <p className="text-sm leading-[1.55] text-neutral-500 dark:text-neutral-400">
            {item.description}
          </p>
        </div>
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
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center px-4 pt-20 pb-24 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,rgba(220,38,38,0.06),transparent_65%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_25%,rgba(220,38,38,0.03),transparent_65%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_80%_15%,rgba(244,63,94,0.05),transparent_45%)] dark:bg-[radial-gradient(circle_at_80%_15%,rgba(244,63,94,0.02),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_75%,rgba(245,158,11,0.04),transparent_45%)] dark:bg-[radial-gradient(circle_at_20%_75%,rgba(245,158,11,0.02),transparent_45%)]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_55%,rgba(0,0,0,0.02)_100%)] dark:bg-[radial-gradient(ellipse_100%_100%_at_50%_50%,transparent_50%,rgba(0,0,0,0.1)_100%)]" />

        <div className="guild-hero-enter pointer-events-none absolute top-[32%] left-1/2 z-[1] -translate-x-1/2 -translate-y-1/2 select-none sm:top-[36%]">
          <div className="guild-icon-breathe relative h-[72vw] w-[72vw] sm:h-[52vw] sm:w-[52vw] md:h-[42vw] md:w-[42vw]">
            <GuildIcon className="h-full w-full text-red-500/[0.08] dark:text-red-400/[0.06]" />
            <div className="guild-icon-breathe-glow absolute inset-0 rounded-full bg-[radial-gradient(circle,rgba(249,115,22,0.1)_0%,rgba(244,63,94,0.05)_40%,transparent_68%)] mix-blend-screen dark:bg-[radial-gradient(circle,rgba(249,115,22,0.06)_0%,rgba(244,63,94,0.03)_40%,transparent_68%)]" />
          </div>
        </div>

        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="guild-ring-1 h-[400px] w-[400px] rounded-full border border-red-500/12 sm:h-[600px] sm:w-[600px] dark:border-red-500/8" />
        </div>
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <div className="guild-ring-2 h-[550px] w-[550px] rounded-full border border-rose-500/8 sm:h-[800px] sm:w-[800px] dark:border-rose-500/4" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-4xl text-center">
          <p
            className="guild-hero-enter mb-5 text-[11px] font-semibold tracking-[0.35em] text-neutral-500 uppercase sm:text-xs sm:tracking-[0.45em] dark:text-neutral-400"
            style={{ animationDelay: "100ms" }}
          >
            {t("kicker")}
          </p>

          <h1
            className="guild-hero-enter mb-5 text-4xl font-black tracking-tight sm:mb-6 sm:text-6xl md:text-7xl lg:text-[4.25rem] dark:tracking-tight"
            style={{ animationDelay: "200ms" }}
          >
            <span className="text-neutral-900 dark:text-white">{t("title.part1")} </span>
            <span className="guild-title-gradient inline-block bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 bg-clip-text text-transparent dark:from-red-400 dark:via-rose-400 dark:to-amber-400">
              {t("title.highlight")}
            </span>
          </h1>

          <p
            className="guild-hero-enter mx-auto mb-12 max-w-xl text-base leading-[1.7] text-neutral-600 sm:mb-14 sm:text-lg dark:text-neutral-400"
            style={{ animationDelay: "300ms" }}
          >
            {t("subtitle")}
          </p>

          <div
            className="guild-hero-enter inline-flex items-center gap-2.5 rounded-full border border-neutral-200/80 bg-white/95 px-4 py-2 shadow-sm backdrop-blur-sm dark:border-neutral-700/60 dark:bg-neutral-900/80"
            style={{ animationDelay: "400ms" }}
          >
            <span className="guild-status-dot relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-70" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
            <span className="text-sm font-medium text-neutral-600 dark:text-neutral-300">
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

        <div
          className="pointer-events-none absolute right-0 bottom-[-50px] left-0 z-[2] h-40 dark:hidden"
          style={{
            background:
              "linear-gradient(to top, rgb(250 250 250) 0%, rgba(250, 250, 250, 0.85) 15%, rgba(250, 250, 250, 0.6) 35%, rgba(250, 250, 250, 0.3) 55%, rgba(250, 250, 250, 0.1) 75%, transparent 100%)",
          }}
        />
        <div
          className="pointer-events-none absolute right-0 bottom-[-50px] left-0 z-[2] hidden h-40 dark:block"
          style={{
            background:
              "linear-gradient(to top, rgb(10 10 10) 0%, rgba(10, 10, 10, 0.85) 15%, rgba(10, 10, 10, 0.6) 35%, rgba(10, 10, 10, 0.3) 55%, rgba(10, 10, 10, 0.1) 75%, transparent 100%)",
          }}
        />
      </section>

      <section className="relative px-4 pt-20 pb-20 sm:pt-28 sm:pb-24">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(220,38,38,0.03),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_40%_at_50%_50%,rgba(220,38,38,0.015),transparent_70%)]" />

        <div className="relative mx-auto max-w-6xl">
          <div className="mb-14 text-center sm:mb-16">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("tiersSection.kicker")}
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl dark:text-white">
              {t("tiersSection.title")}
            </h2>
            <p className="mx-auto max-w-lg text-sm leading-[1.6] text-neutral-500 dark:text-neutral-400">
              {t("tiersSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 sm:gap-6 md:grid-cols-3">
            {tiers.map((tier) => (
              <TierCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 sm:py-24">
        <div className="relative mx-auto max-w-2xl">
          <article className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50/90 via-white to-neutral-50/90 px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-10 sm:py-10 dark:border-neutral-700/40 dark:from-neutral-900/80 dark:via-neutral-900 dark:to-neutral-900/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-400/60 via-rose-400/50 to-red-400/40 dark:from-amber-500/40 dark:via-rose-500/30 dark:to-red-500/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(251,191,36,0.04),transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(251,191,36,0.02),transparent_60%)]" />
            <div className="relative pl-5 sm:pl-6">
              <p className="mb-3 text-[10px] font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
                {t("openNoteLabel")}
              </p>
              <p className="text-base leading-[1.75] text-neutral-700 sm:text-[1.0625rem] sm:leading-[1.8] dark:text-neutral-200">
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

      <section className="relative px-4 pt-20 pb-20 sm:pt-24 sm:pb-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.03),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.015),transparent_60%)]" />

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("perksSection.kicker")}
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl dark:text-white">
              {t("perksSection.title")}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-[1.6] text-neutral-500 dark:text-neutral-400">
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

      <section className="relative px-4 py-20 sm:py-28">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(244,63,94,0.04),transparent_65%)] dark:bg-[radial-gradient(ellipse_80%_60%_at_50%_50%,rgba(244,63,94,0.02),transparent_65%)]" />

        <div className="relative mx-auto max-w-2xl text-center">
          <div className="relative overflow-hidden rounded-3xl border border-neutral-200/60 bg-white/80 px-8 py-14 shadow-[0_8px_50px_-12px_rgba(0,0,0,0.06)] backdrop-blur-2xl sm:px-14 sm:py-16 dark:border-neutral-800/60 dark:bg-neutral-950/60 dark:shadow-[0_8px_50px_-12px_rgba(0,0,0,0.4)]">
            {/* Gradient mesh background */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-rose-500/[0.03] via-transparent to-amber-500/[0.03] dark:from-rose-500/[0.04] dark:to-amber-500/[0.04]" />
            <div className="pointer-events-none absolute -top-32 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-rose-500/10 blur-[100px] dark:bg-rose-500/8" />
            <div className="pointer-events-none absolute right-0 -bottom-24 h-48 w-48 rounded-full bg-amber-500/8 blur-[80px] dark:bg-amber-500/6" />

            {/* Subtle border glow */}
            <div className="pointer-events-none absolute inset-0 rounded-3xl border border-rose-500/10 dark:border-rose-500/5" />

            <div className="relative">
              {/* Floating icon - no container, just pure icon with soft glow */}
              <div className="relative mb-8 inline-flex">
                <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-amber-500 opacity-30 blur-2xl" />
                <GuildIcon className="relative h-12 w-12 text-neutral-900 dark:text-white" />
              </div>

              {/* Title with subtle gradient */}
              <h2 className="mb-5 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                {t("cta.title")}
              </h2>

              <p className="mx-auto mb-10 max-w-md text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t("cta.body")}
              </p>

              {/* Minimal status indicator */}
              <div className="inline-flex items-center gap-2.5 rounded-full bg-neutral-100/80 px-4 py-2 dark:bg-neutral-800/60">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-60" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
                </span>
                <span className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
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
