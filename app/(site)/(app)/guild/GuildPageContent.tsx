"use client";

import { useTranslations } from "next-intl";
import { type CSSProperties, useEffect, useState } from "react";

import { NewsletterSection } from "@/components/newsletter/NewsletterSection";
import {
  BoltIcon,
  CheckIcon,
  FilmIcon,
  GuildIcon,
  InfoIcon,
  SparklesIcon,
  UsersIcon,
} from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { useGuildSubscription } from "@/lib/api/subscription";
import { getGuildTierCopy } from "@/lib/billing/guild-tier-copy";
import {
  GUILD_TIER_MARKETING_CARD_STYLES,
  GUILD_TIER_PREVIEW_TINTS,
  type GuildTierMarketingCardStyle,
} from "@/lib/billing/guild-tier-styles";
import type { GuildMembershipTier } from "@/lib/config/guild-membership";
import { useAuthStatus } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const guildRichBold = (chunks: React.ReactNode) => (
  <strong className="font-semibold text-neutral-900 dark:text-white">{chunks}</strong>
);

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

interface GuildTierCardData extends GuildTierMarketingCardStyle {
  actionHref?: string;
  actionLabel: string;
  badgeText: string;
  features: string[];
  handleAction?: () => void;
  name: string;
  price: string;
  primary: boolean;
  selected: boolean;
  showPrice: boolean;
  tagline: string;
}

function TierCard({ tier }: { tier: GuildTierCardData }) {
  return (
    <div
      className={`surface relative flex h-full flex-col overflow-hidden p-6 transition-colors duration-500 sm:p-7 ${
        tier.selected ? tier.selectedBorder : "hover:border-black/15 dark:hover:border-white/20"
      }`}
    >
      <div
        className={`pointer-events-none absolute inset-0 bg-gradient-to-b to-transparent to-60% transition-opacity duration-500 ${tier.selectedWash} ${
          tier.selected ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent to-transparent transition-opacity duration-500 ${tier.selectedLine} ${
          tier.selected ? "opacity-100" : "opacity-0"
        }`}
      />

      <div className="relative flex h-full flex-col">
        <p className={`eyebrow text-2xs ${tier.accent}`}>{tier.badgeText}</p>
        <h3 className="mt-3 text-2xl font-black tracking-tight text-neutral-900 dark:text-white">
          {tier.name}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 md:min-h-[2.75rem] dark:text-neutral-400">
          {tier.tagline}
        </p>
        {tier.showPrice ? (
          <p className="mt-5 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            {tier.price}
          </p>
        ) : null}

        <div className="my-6 h-px bg-black/8 dark:bg-white/8" />

        <ul className="flex-1 space-y-3">
          {tier.features.map((feature) => (
            <li key={feature} className="flex items-start gap-3">
              <CheckIcon className={`mt-0.5 h-4 w-4 shrink-0 ${tier.accent}`} aria-hidden="true" />
              <span className="text-sm leading-[1.5] text-neutral-700 dark:text-neutral-300">
                {feature}
              </span>
            </li>
          ))}
        </ul>

        <Button
          href={tier.actionHref}
          onClick={tier.handleAction}
          variant={tier.primary ? "primary" : "plain"}
          size="md"
          className={`mt-8 w-full duration-300 ${
            tier.primary
              ? ""
              : tier.selected
                ? "bg-neutral-900 text-white hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200"
                : "btn-outline rounded-xl"
          }`}
        >
          {tier.actionLabel}
        </Button>
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

const DEFAULT_PERK_CHROME = {
  accent: "text-orange-600 dark:text-orange-300",
  iconSurface: "bg-orange-100 dark:bg-orange-500/12",
};

function PerkCard({
  chrome,
  item,
}: {
  chrome: { accent: string; iconSurface: string };
  item: { title: string; description?: string; icon: string };
}) {
  const Icon = PERK_ICON_MAP[item.icon] ?? SparklesIcon;

  return (
    <div className="surface h-full p-6 sm:p-7">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${chrome.iconSurface} ${chrome.accent}`}
      >
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="mt-5 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
        {item.title}
      </h3>
      {item.description ? (
        <p className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
          {item.description}
        </p>
      ) : null}
    </div>
  );
}

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
  const previewPerkItems = activePreviewTier
    ? previewPerks[
        activePreviewTier === 1 ? "scout" : activePreviewTier === 2 ? "explorer" : "trailblazer"
      ]
    : ((t.raw("perksSection.items") as { title: string; description: string; icon: string }[]) ??
      []);
  const perkChrome = activePreviewTier
    ? GUILD_TIER_MARKETING_CARD_STYLES[activePreviewTier]
    : DEFAULT_PERK_CHROME;

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
    if (activePreviewTier === tier) {
      return t("tiers.actions.previewing");
    }

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
    primary: isEnabled,
  }));

  const tiersWithActions = tiers.map((tier, index) => ({
    ...tier,
    actionLabel: getTierActionLabel((index + 1) as 1 | 2 | 3, tier.name),
  }));

  return (
    <div className="relative overflow-hidden">
      {!isEnabled ? (
        <div className="pointer-events-none absolute inset-0">
          {([1, 2, 3] as const).map((tierKey) => {
            const tint = GUILD_TIER_PREVIEW_TINTS[tierKey];

            return (
              <div
                key={tierKey}
                className={`absolute inset-0 transition-opacity duration-700 ease-out ${
                  activePreviewTier === tierKey ? "opacity-100" : "opacity-0"
                }`}
              >
                <div
                  className="absolute inset-0 dark:hidden"
                  style={{
                    background: `radial-gradient(circle at 16% 18%, ${tint.glowStrong}, transparent 28%), radial-gradient(circle at 84% 12%, ${tint.glow}, transparent 30%), radial-gradient(circle at 50% 72%, ${tint.glow}, transparent 34%)`,
                  }}
                />
                <div
                  className="absolute inset-0 hidden dark:block"
                  style={{
                    background: `radial-gradient(circle at 16% 18%, ${tint.darkGlowStrong}, transparent 30%), radial-gradient(circle at 84% 12%, ${tint.darkGlow}, transparent 34%), radial-gradient(circle at 50% 72%, ${tint.darkGlow}, transparent 38%)`,
                  }}
                />
              </div>
            );
          })}
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
            className="guild-hero-enter text-2xs tracking-label-lg sm:tracking-label-lg mb-5 font-semibold text-neutral-500 uppercase sm:text-xs dark:text-neutral-400"
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

        <div
          className="pointer-events-none absolute inset-0 z-[1] overflow-hidden [mask-image:linear-gradient(to_top,transparent,black_160px)]"
          aria-hidden
        >
          {embers.map((style) => (
            <GuildEmber
              key={`guild-ember-${String(style.left)}-${String(style.animationDelay)}-${String(style.animationDuration)}`}
              style={style}
              visible={embersVisible}
            />
          ))}
        </div>
      </section>

      <section className="relative px-4 pt-16 pb-20 sm:pt-24 sm:pb-24">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-xl text-center sm:mb-14">
            <p className="eyebrow text-2xs mb-3 text-neutral-500 dark:text-neutral-400">
              {t("tiersSection.kicker")}
            </p>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              {t("tiersSection.title")}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
              {t("tiersSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3 md:gap-5">
            {tiersWithActions.map((tier) => (
              <TierCard key={tier.name} tier={tier} />
            ))}
          </div>

          <p className="mx-auto mt-8 flex max-w-2xl items-start justify-center gap-2.5 text-sm leading-relaxed text-neutral-600 sm:mt-10 dark:text-neutral-400">
            <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-neutral-400 dark:text-neutral-500" />
            <span>{t.rich("openNote", { bold: guildRichBold })}</span>
          </p>
        </div>
      </section>

      <section className="relative px-4 pt-8 pb-20 sm:pt-12 sm:pb-28">
        <div className="mx-auto max-w-5xl">
          <div
            key={`perks-head-${activePreviewTier ?? 0}`}
            className="guild-swap-enter mx-auto mb-12 max-w-xl text-center sm:mb-14"
          >
            <p
              className={`eyebrow text-2xs mb-3 ${
                previewDetails ? perkChrome.accent : "text-neutral-500 dark:text-neutral-400"
              }`}
            >
              {previewDetails?.name ?? t("perksSection.kicker")}
            </p>
            <h2 className="mb-3 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
              {t("perksSection.title")}
            </h2>
            <p className="text-sm leading-relaxed text-neutral-600 sm:text-base dark:text-neutral-400">
              {previewDetails?.tagline ?? t("perksSection.subtitle")}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5">
            {previewPerkItems.map((item, index) => (
              <div
                key={`${activePreviewTier ?? 0}-${item.title}`}
                className="guild-swap-enter"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <PerkCard item={item} chrome={perkChrome} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {!isEnabled ? <NewsletterSection subtitle={t("newsletter.subtitle")} /> : null}
    </div>
  );
}
