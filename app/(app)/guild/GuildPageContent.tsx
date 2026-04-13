"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useState } from "react";

import { NewsletterSection } from "@/components/newsletter/NewsletterSection";
import {
  BoltIcon,
  CheckIcon,
  FilmIcon,
  GuildIcon,
  SparklesIcon,
  StarFilledIcon,
  UsersIcon,
} from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { useGuildSubscription } from "@/lib/api/subscription";
import { getGuildTierCopy } from "@/lib/billing/guild-tier-copy";
import {
  GUILD_TIER_MARKETING_CARD_STYLES,
  GUILD_TIER_PREVIEW_TINTS,
} from "@/lib/billing/guild-tier-styles";
import type { GuildMembershipTier } from "@/lib/config/guild-membership";
import { useAuthStatus } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

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

function TierCard({
  tier,
}: {
  tier: {
    actionHref?: string;
    actionLabel: string;
    actionClassName: string;
    handleAction?: () => void;
    price: string;
    name: string;
    tagline: string;
    features: string[];
    accent: string;
    glow: string;
    selectedGlow: string;
    gradient: string;
    border: string;
    iconBg: string;
    badge: string;
    badgeText: string;
    showPrice: boolean;
    selected?: boolean;
  };
}) {
  return (
    <div
      className={`guild-tier-card group relative flex h-full flex-col overflow-hidden rounded-2xl border ${tier.border} bg-white/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] hover:shadow-[0_8px_30px_-8px_rgba(0,0,0,0.12)] dark:bg-neutral-950/80 dark:shadow-none dark:hover:shadow-[0_8px_40px_-8px_rgba(0,0,0,0.35)] ${
        tier.selected
          ? "guild-tier-card--selected shadow-[0_28px_72px_-28px_rgba(15,23,42,0.22)] dark:shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]"
          : "guild-tier-card--idle"
      }`}
    >
      {tier.selected ? (
        <>
          <div
            className={`guild-tier-glow-ambient pointer-events-none absolute inset-[-1px] rounded-[1.08rem] ${tier.selectedGlow} blur-sm`}
          />
          <div
            className={`guild-tier-glow-ambient pointer-events-none absolute inset-[-6px] rounded-[1.35rem] ${tier.selectedGlow} blur-xl [animation-delay:0.35s]`}
          />
        </>
      ) : null}
      <div className={`relative flex h-full ${tier.gradient} p-px`}>
        <div className="relative flex h-full w-full flex-col rounded-[15px] bg-white/95 p-6 backdrop-blur-sm sm:p-7 dark:bg-neutral-950/95">
          {tier.selected ? (
            <>
              <div className="pointer-events-none absolute inset-0 rounded-[15px] ring-1 ring-white/70 dark:ring-white/12" />
              <div className="pointer-events-none absolute inset-[1px] rounded-[14px] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),inset_0_0_0_1px_rgba(255,255,255,0.12)] dark:shadow-[inset_0_1px_0_rgba(255,255,255,0.12),inset_0_0_0_1px_rgba(255,255,255,0.06)]" />
              <div
                className={`pointer-events-none absolute -inset-8 ${tier.selectedGlow} opacity-60 blur-3xl`}
              />
              <div
                className={`pointer-events-none absolute -top-16 -right-12 h-40 w-40 rounded-full ${tier.selectedGlow} opacity-70 blur-3xl`}
              />
              <div
                className={`pointer-events-none absolute -bottom-14 -left-10 h-36 w-36 rounded-full ${tier.selectedGlow} opacity-65 blur-3xl`}
              />
            </>
          ) : null}
          <div
            className={`pointer-events-none absolute -top-24 -right-24 h-48 w-48 rounded-full ${tier.glow} opacity-80 blur-3xl`}
          />
          <div
            className={`pointer-events-none absolute -bottom-20 -left-20 h-40 w-40 rounded-full ${tier.glow} opacity-40 blur-3xl`}
          />

          <div className="relative flex h-full flex-col">
            <div className="min-h-[150px]">
              <div className="mb-4">
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold tracking-widest uppercase ${tier.badge}`}
                >
                  <StarFilledIcon className="h-2.5 w-2.5" />
                  {tier.badgeText}
                </span>
              </div>

              <h3 className={`mb-2 text-xl font-black tracking-tight sm:text-2xl ${tier.accent}`}>
                {tier.name}
              </h3>
              {tier.showPrice ? (
                <p className="mb-1 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                  {tier.price}
                </p>
              ) : null}
              <p className="text-sm leading-[1.55] text-neutral-500 dark:text-neutral-400">
                {tier.tagline}
              </p>
            </div>

            <div className="my-5 h-px w-full bg-gradient-to-r from-transparent via-neutral-200/80 to-transparent dark:via-neutral-700/60" />

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

            <div className="mt-6 pt-1">
              <span className="block">
                <Button
                  href={tier.actionHref}
                  onClick={tier.handleAction}
                  variant="plain"
                  size="sm"
                  className={`w-full rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(15,23,42,0.3)] transition-[transform,box-shadow,filter] duration-300 hover:-translate-y-px hover:brightness-105 ${tier.actionClassName}`}
                >
                  {tier.actionLabel}
                </Button>
              </span>
            </div>
          </div>
        </div>
      </div>

      {tier.selected ? (
        <div
          className="guild-tier-shimmer pointer-events-none absolute inset-0 z-[5] overflow-hidden rounded-2xl"
          aria-hidden
        >
          <div className="guild-tier-shimmer-beam" />
        </div>
      ) : null}
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
  "text-rose-500 dark:text-rose-400",
  "text-emerald-500 dark:text-emerald-400",
];

function PerkCard({
  accentClassName,
  item,
  index,
}: {
  accentClassName?: string;
  item: { eyebrow?: string; title: string; description?: string; icon: string };
  index: number;
}) {
  const Icon = PERK_ICON_MAP[item.icon] ?? SparklesIcon;
  const accent = accentClassName ?? PERK_ACCENT[index % PERK_ACCENT.length] ?? PERK_ACCENT[0];

  return (
    <div className="relative overflow-hidden rounded-2xl border border-neutral-200/60 bg-white/78 p-6 shadow-[0_10px_32px_-28px_rgba(15,23,42,0.32)] backdrop-blur-sm sm:p-7 dark:border-neutral-800/60 dark:bg-neutral-950/50 dark:shadow-none">
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-neutral-50/50 via-transparent to-neutral-100/30 dark:from-neutral-900/30 dark:to-neutral-800/20" />

      <div className="relative flex gap-5">
        <div className="relative flex h-12 w-12 shrink-0 items-center justify-center">
          <div className={`absolute inset-0 ${accent} opacity-18 blur-xl`}>
            <Icon className="h-full w-full opacity-90" />
          </div>
          <div className="absolute inset-0 rounded-2xl bg-white/70 dark:bg-white/5" />
          <Icon className={`relative h-5 w-5 ${accent}`} />
        </div>

        <div className="min-w-0 flex-1">
          {item.eyebrow ? (
            <p className="mb-1 text-[10px] font-semibold tracking-[0.22em] text-neutral-500 uppercase dark:text-neutral-400">
              {item.eyebrow}
            </p>
          ) : null}
          <h3 className="mb-1.5 text-lg font-semibold tracking-tight text-neutral-900 dark:text-white">
            {item.title}
          </h3>
          {item.description ? (
            <p className="max-w-[34ch] text-sm leading-[1.65] text-neutral-600 dark:text-neutral-400">
              {item.description}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

const PREVIEW_ICONS = ["film", "sparkles", "bolt", "users"] as const;

export function GuildPageContent({
  isEnabled,
  prices,
}: {
  isEnabled: boolean;
  prices: Record<GuildMembershipTier, string>;
}) {
  const t = useTranslations("guildPage");
  const { isAuthenticated, isPending } = useAuthStatus();
  const [embers, setEmbers] = useState<CSSProperties[]>([]);
  const [embersVisible, setEmbersVisible] = useState(false);
  const [previewTier, setPreviewTier] = useState<GuildMembershipTier>(2);
  const subscriptionQuery = useGuildSubscription(!isPending && isAuthenticated);
  const tierCopy = getGuildTierCopy(t);
  const hasActiveSubscription = Boolean(subscriptionQuery.data?.isActive);
  const previewPerks = t.raw("previewPerks") as Record<
    "scout" | "explorer" | "trailblazer",
    { title: string; description: string; icon: string }[]
  >;
  const getTierPriceLabel = (tier: GuildMembershipTier) =>
    isEnabled ? t("tiers.priceWithInterval", { amount: prices[tier] }) : prices[tier];
  const activePreviewTier = !isEnabled && !hasActiveSubscription ? previewTier : null;
  const previewDetails = activePreviewTier ? tierCopy[activePreviewTier] : null;
  const previewTint = activePreviewTier ? GUILD_TIER_PREVIEW_TINTS[activePreviewTier] : null;
  const previewPerkItems = previewDetails
    ? previewPerks[
        activePreviewTier === 1 ? "scout" : activePreviewTier === 2 ? "explorer" : "trailblazer"
      ].map((item, index) => ({
        ...item,
        eyebrow: previewDetails.name,
        icon: item.icon || PREVIEW_ICONS[index % PREVIEW_ICONS.length],
      }))
    : ((t.raw("perksSection.items") as { title: string; description: string; icon: string }[]) ??
      []);

  useEffect(() => {
    setEmbers(generateGuildEmbers());
    const timer = setTimeout(() => setEmbersVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getTierHref = (tier: 1 | 2 | 3) => {
    if (isPending) {
      return PAGE_ROUTES.GUILD;
    }

    if (hasActiveSubscription) {
      return PAGE_ROUTES.ME;
    }

    if (!isEnabled) {
      return PAGE_ROUTES.GUILD;
    }

    if (isAuthenticated) {
      return PAGE_ROUTES.ME_GUILD_JOIN({ tier });
    }

    return `/login?returnPath=${encodeURIComponent(PAGE_ROUTES.ME_GUILD_JOIN({ tier }))}`;
  };

  const getTierActionLabel = (tier: 1 | 2 | 3, name: string) => {
    if (isPending) {
      return t("tiers.actions.loading");
    }

    if (subscriptionQuery.isLoading) {
      return t("tiers.actions.loading");
    }

    if (hasActiveSubscription) {
      return t("tiers.actions.manage");
    }

    if (!isEnabled) {
      return t("tiers.actions.preview");
    }

    if (isAuthenticated) {
      return t("tiers.actions.choose", { name });
    }

    return t("tiers.actions.signIn");
  };

  const tiers = ([1, 2, 3] as const).map((tierKey) => ({
    actionHref: isEnabled ? getTierHref(tierKey) : undefined,
    handleAction: !isEnabled ? () => setPreviewTier(tierKey) : undefined,
    price: getTierPriceLabel(tierKey),
    ...tierCopy[tierKey],
    ...GUILD_TIER_MARKETING_CARD_STYLES[tierKey],
    badgeText: tierCopy[tierKey].badge,
    showPrice: isEnabled,
    selected: activePreviewTier === tierKey,
  }));

  const tiersWithActions = tiers.map((tier, index) => ({
    ...tier,
    actionLabel: getTierActionLabel((index + 1) as 1 | 2 | 3, tier.name),
  }));

  return (
    <div className="relative overflow-hidden">
      {previewTint ? (
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute inset-0 dark:hidden"
            style={{
              background: `radial-gradient(circle at 16% 18%, ${previewTint.glowStrong}, transparent 28%), radial-gradient(circle at 84% 12%, ${previewTint.glow}, transparent 30%), radial-gradient(circle at 50% 72%, ${previewTint.glow}, transparent 34%)`,
            }}
          />
          <div
            className="absolute inset-0 hidden dark:block"
            style={{
              background: `radial-gradient(circle at 16% 18%, ${previewTint.darkGlowStrong}, transparent 30%), radial-gradient(circle at 84% 12%, ${previewTint.darkGlow}, transparent 34%), radial-gradient(circle at 50% 72%, ${previewTint.darkGlow}, transparent 38%)`,
            }}
          />
        </div>
      ) : null}
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
              {isEnabled ? t("status.live") : t("status.comingSoon")}
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
          {embers.map((style) => (
            <GuildEmber
              key={`guild-ember-${String(style.left)}-${String(style.animationDelay)}-${String(style.animationDuration)}`}
              style={style}
              visible={embersVisible}
            />
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
            {tiersWithActions.map((tier) => (
              <TierCard key={tier.name} tier={tier} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-4 py-20 sm:py-24">
        <div className="relative mx-auto max-w-2xl">
          <article className="relative overflow-hidden rounded-2xl border border-neutral-200/90 bg-gradient-to-br from-neutral-50/90 via-white to-neutral-50/90 px-8 py-8 shadow-[0_1px_3px_rgba(0,0,0,0.04),inset_0_1px_0_rgba(255,255,255,0.8)] sm:px-10 sm:py-10 dark:border-neutral-700/40 dark:from-neutral-900/80 dark:via-neutral-900 dark:to-neutral-900/80 dark:shadow-[0_1px_0_rgba(255,255,255,0.03)_inset]">
            <div className="absolute top-0 left-0 h-full w-1 bg-gradient-to-b from-amber-400/60 via-rose-400/50 to-red-400/40 dark:from-amber-500/40 dark:via-rose-500/30 dark:to-red-500/30" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,rgba(251,191,36,0.04),transparent_60%)] dark:bg-[radial-gradient(ellipse_80%_50%_at_50%_at_50%_0%,rgba(251,191,36,0.02),transparent_60%)]" />
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
        <div
          className={`pointer-events-none absolute inset-0 ${
            previewTint
              ? ""
              : "bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.03),transparent_60%)] dark:bg-[radial-gradient(ellipse_70%_50%_at_50%_0%,rgba(244,63,94,0.015),transparent_60%)]"
          }`}
          style={
            previewTint
              ? {
                  background: `radial-gradient(ellipse 70% 50% at 50% 0%, ${previewTint.glowStrong}, transparent 60%)`,
                }
              : undefined
          }
        />
        {previewTint ? (
          <div
            className="pointer-events-none absolute inset-0 hidden dark:block"
            style={{
              background: `radial-gradient(ellipse 72% 54% at 50% 0%, ${previewTint.darkGlowStrong}, transparent 62%)`,
            }}
          />
        ) : null}

        <div className="relative mx-auto max-w-5xl">
          <div className="mb-12 text-center sm:mb-16">
            <p className="mb-3 text-[11px] font-semibold tracking-[0.28em] text-neutral-500 uppercase dark:text-neutral-400">
              {t("perksSection.kicker")}
            </p>
            <h2 className="mb-3 text-2xl font-black tracking-tight text-neutral-900 sm:text-3xl md:text-4xl dark:text-white">
              {t("perksSection.title")}
            </h2>
            <p className="mx-auto max-w-xl text-sm leading-[1.6] text-neutral-500 dark:text-neutral-400">
              {previewDetails?.tagline ?? t("perksSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 sm:gap-6">
            {previewPerkItems.map((item, i) => (
              <PerkCard
                key={item.title}
                item={item}
                index={i}
                accentClassName={previewTint?.iconAccent}
              />
            ))}
          </div>

          {previewDetails ? (
            <div className="mt-8 flex justify-center">
              <div
                className={`rounded-full border px-4 py-2 text-sm font-medium text-neutral-700 backdrop-blur-sm dark:text-neutral-200 ${
                  previewTint?.ring ?? "border-neutral-200/70 dark:border-neutral-700/60"
                } bg-gradient-to-r ${previewTint?.card ?? "from-white/80 via-white/70 to-white/80"}`}
              >
                {previewDetails.name}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {!isEnabled ? <NewsletterSection subtitle={t("newsletter.subtitle")} /> : null}
    </div>
  );
}
