"use client";

import { useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import {
  ArrowLeftIcon,
  CheckIcon,
  ExternalLinkIcon,
  GuildIcon,
  StarFilledIcon,
} from "@/components/shared/Icons";
import { AsyncButtonContent } from "@/components/ui/AsyncButtonContent";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import {
  useCreateGuildCheckoutMutation,
  useCreateGuildPortalMutation,
  useGuildSubscription,
} from "@/lib/api/subscription";
import {
  beginGuildActivationLock,
  clearGuildActivationLock,
  readGuildActivationLock,
} from "@/lib/billing/guild-activation";
import { getGuildTierCopy } from "@/lib/billing/guild-tier-copy";
import { GUILD_TIER_JOIN_STYLES } from "@/lib/billing/guild-tier-styles";
import type { GuildMembershipTier } from "@/lib/config/guild-membership";
import { useAuthStatus } from "@/lib/redux/hooks";
import { PAGE_ROUTES } from "@/lib/routes/pages";

const BILLING_TIERS = [1, 2, 3] as const;

function TierCard({
  badge,
  disabled,
  faded,
  name,
  onClick,
  price,
  selected,
  showPrice = true,
  tier,
}: {
  badge: string;
  disabled?: boolean;
  faded?: boolean;
  name: string;
  onClick: () => void;
  price: string;
  selected: boolean;
  showPrice?: boolean;
  tier: 1 | 2 | 3;
}) {
  const colors = GUILD_TIER_JOIN_STYLES[tier];

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`group w-full rounded-2xl p-px text-left transition-all duration-300 focus-visible:ring-2 focus-visible:ring-amber-500/60 focus-visible:outline-none disabled:cursor-not-allowed ${
        faded ? "opacity-45 saturate-50" : "opacity-100"
      }`}
      style={{
        background: selected
          ? `linear-gradient(135deg, ${colors.glowColor.replace("0.12", "0.6")} 0%, ${colors.glowColor.replace("0.12", "0.25")} 50%, transparent 100%)`
          : "rgba(0,0,0,0.06)",
      }}
    >
      <div
        className={`relative overflow-hidden rounded-[15px] bg-white transition-all duration-300 dark:bg-neutral-950 ${
          selected
            ? "shadow-[0_4px_24px_-6px_rgba(0,0,0,0.1)] dark:shadow-[0_4px_24px_-6px_rgba(0,0,0,0.4)]"
            : "group-hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.07)] dark:group-hover:shadow-[0_2px_12px_-4px_rgba(0,0,0,0.3)]"
        }`}
      >
        {selected ? (
          <>
            <div
              className={`pointer-events-none absolute -top-10 -right-10 h-28 w-28 rounded-full ${colors.glow} opacity-[0.15] blur-2xl`}
            />
            <div
              className={`pointer-events-none absolute -bottom-8 -left-8 h-20 w-20 rounded-full ${colors.glow} opacity-[0.10] blur-xl`}
            />
          </>
        ) : null}

        <div className="relative flex items-center gap-3.5 px-4 py-3.5">
          {/* Icon */}
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${colors.iconBg} shadow-sm transition-transform duration-200 group-hover:scale-[1.04]`}
          >
            <StarFilledIcon className="h-4 w-4 text-white" />
          </div>

          {/* Name + badge + price */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <span
                className={`text-sm font-black tracking-tight transition-colors duration-200 ${
                  selected ? colors.accent : "text-neutral-900 dark:text-white"
                }`}
              >
                {name}
              </span>
              <span
                className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${colors.badge}`}
              >
                {badge}
              </span>
            </div>
            {showPrice ? (
              <p
                className={`mt-0.5 text-xs font-semibold tabular-nums transition-colors duration-200 ${
                  selected ? colors.accent : "text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {price}
              </p>
            ) : null}
          </div>

          {/* Check indicator */}
          <div
            className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full transition-all duration-200 ${
              selected
                ? `${colors.checkBg} shadow-sm`
                : "border border-neutral-300 dark:border-white/20"
            }`}
          >
            {selected ? <CheckIcon className="h-3 w-3 text-white" /> : null}
          </div>
        </div>
      </div>
    </button>
  );
}

function getApiErrorMessage(
  t: ReturnType<typeof useTranslations<"account.guild">>,
  err: unknown,
): string {
  if (!(err instanceof ApiError) || typeof err.data !== "string") {
    return t("errors.generic");
  }
  if (err.data === "already_subscribed") {
    return t("errors.alreadySubscribed");
  }
  if (err.data === "subscription_managed_in_portal") {
    return t("errors.managedInPortal");
  }
  return t("errors.generic");
}

export function GuildJoinPage({
  isEnabled,
  prices,
}: {
  isEnabled: boolean;
  prices: Record<GuildMembershipTier, string>;
}) {
  const t = useTranslations("account.guild");
  const tGuild = useTranslations("guildPage");
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated, isPending } = useAuthStatus();

  const requestedTier = searchParams.get("tier");
  const checkoutState = searchParams.get("checkout-state");
  const [activationLockTier, setActivationLockTier] = useState<1 | 2 | 3 | null>(
    () => readGuildActivationLock()?.tier ?? null,
  );
  const [selectedTier, setSelectedTier] = useState<1 | 2 | 3>(() => {
    if (requestedTier === "1" || requestedTier === "2" || requestedTier === "3") {
      return Number(requestedTier) as 1 | 2 | 3;
    }
    return 1;
  });

  const subscriptionQuery = useGuildSubscription(!isPending && isAuthenticated);
  const checkoutMutation = useCreateGuildCheckoutMutation();
  const portalMutation = useCreateGuildPortalMutation();

  useEffect(() => {
    if (isPending) {
      return;
    }
    if (!isAuthenticated) {
      router.replace(
        `/login?returnPath=${encodeURIComponent(PAGE_ROUTES.ME_GUILD_JOIN({ tier: selectedTier }))}`,
      );
    }
  }, [isPending, isAuthenticated, router, selectedTier]);

  useEffect(() => {
    const activeTier = subscriptionQuery.data?.isActive ? subscriptionQuery.data.tier : null;

    if (activeTier === 1 || activeTier === 2 || activeTier === 3) {
      clearGuildActivationLock();
      setActivationLockTier(null);
      setSelectedTier(activeTier);
    }
  }, [subscriptionQuery.data?.isActive, subscriptionQuery.data?.tier]);

  useEffect(() => {
    if (checkoutState === "canceled") {
      clearGuildActivationLock();
      setActivationLockTier(null);
      return;
    }

    const syncLock = () => {
      setActivationLockTier(readGuildActivationLock()?.tier ?? null);
    };

    window.addEventListener("storage", syncLock);
    window.addEventListener("focus", syncLock);

    return () => {
      window.removeEventListener("storage", syncLock);
      window.removeEventListener("focus", syncLock);
    };
  }, [checkoutState]);

  const tierData = getGuildTierCopy(tGuild);

  const startCheckout = async () => {
    const response = await checkoutMutation.mutateAsync({ tier: selectedTier });
    beginGuildActivationLock(selectedTier);
    setActivationLockTier(selectedTier);
    window.location.assign(response.url);
  };

  if (isEnabled && !isAuthenticated && !isPending) {
    return null;
  }

  const colors = GUILD_TIER_JOIN_STYLES[selectedTier];
  const selectedTierDetails = tierData[selectedTier];
  const highlightedPerks = (t.raw("perks") as string[]).slice(0, 3);
  const isActivationLocked =
    isEnabled && activationLockTier !== null && checkoutState !== "canceled";
  const activeTier = subscriptionQuery.data?.isActive ? subscriptionQuery.data.tier : null;
  const hasActiveTier = activeTier === 1 || activeTier === 2 || activeTier === 3;
  const isSelectionLocked = hasActiveTier;
  const isSubmitting = checkoutMutation.isPending || portalMutation.isPending;
  const showManageButton = hasActiveTier;
  const tierLabel = showManageButton ? t("dialog.activeTier") : t("dialog.selectedTier");

  const activeError = checkoutMutation.isError
    ? getApiErrorMessage(t, checkoutMutation.error)
    : portalMutation.isError
      ? t("errors.generic")
      : null;
  const disabledNoticeBody = hasActiveTier ? t("disabled.activeNotice") : t("disabled.body");

  const handlePrimaryAction = () => {
    if (showManageButton) {
      portalMutation
        .mutateAsync()
        .then((response) => {
          window.location.assign(response.url);
        })
        .catch(() => undefined);
      return;
    }

    startCheckout().catch(() => undefined);
  };

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-20 pb-24 sm:pt-32">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.08),transparent_38%)] dark:bg-[radial-gradient(circle_at_top,rgba(245,158,11,0.05),transparent_36%)]" />
      <div className="pointer-events-none absolute inset-x-0 top-24 mx-auto h-72 max-w-5xl rounded-full bg-amber-200/20 blur-3xl dark:bg-amber-500/8" />

      <div className="relative mx-auto max-w-6xl">
        {/* Back link — matches the /me page shell */}
        <Link
          href={PAGE_ROUTES.ME}
          className="group inline-flex items-center gap-1.5 text-sm text-neutral-500 transition hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white"
        >
          <ArrowLeftIcon className="h-3.5 w-3.5 transition-transform group-hover:-translate-x-0.5" />
          {t("join.back")}
        </Link>

        {/* Two-column layout: context left, form right */}
        <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:items-start lg:gap-10">
          {/* Left: heading + perks */}
          <div className="space-y-6">
            <section className="relative overflow-hidden rounded-[32px] border border-white/70 bg-[linear-gradient(145deg,rgba(255,255,255,0.95),rgba(255,250,245,0.88)_52%,rgba(255,246,237,0.92))] p-6 shadow-[0_24px_80px_-40px_rgba(15,23,42,0.32)] sm:p-8 dark:border-white/10 dark:bg-[linear-gradient(145deg,rgba(24,24,24,0.94),rgba(18,18,18,0.98)_56%,rgba(36,24,18,0.92))] dark:shadow-[0_24px_90px_-44px_rgba(0,0,0,0.55)]">
              <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.16),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.08),transparent_30%)] dark:bg-[radial-gradient(circle_at_top_right,rgba(251,191,36,0.09),transparent_24%),radial-gradient(circle_at_bottom_left,rgba(244,63,94,0.05),transparent_28%)]" />
              <div className="relative">
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-amber-300/50 bg-white/80 shadow-sm dark:border-amber-400/20 dark:bg-white/8">
                    <GuildIcon className="h-4 w-4 text-amber-600 dark:text-amber-300" />
                  </div>
                  <span className="text-[11px] font-semibold tracking-[0.28em] text-amber-700/80 uppercase dark:text-amber-300/75">
                    {t("kicker")}
                  </span>
                </div>

                <h1 className="max-w-xl text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
                  {t("join.title")}
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-neutral-600 dark:text-neutral-400">
                  {t("join.subtitle")}
                </p>

                <div className="mt-8 grid gap-3 sm:grid-cols-3">
                  {highlightedPerks.map((perk) => (
                    <div
                      key={perk}
                      className="rounded-2xl border border-neutral-200/80 bg-white/75 px-4 py-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/6 dark:shadow-none"
                    >
                      <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm">
                        <StarFilledIcon className="h-3.5 w-3.5 text-white" />
                      </div>
                      <p className="text-sm leading-[1.55] text-neutral-700 dark:text-neutral-300">
                        {perk}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="mt-8 overflow-hidden rounded-[28px] border border-neutral-200/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(250,250,249,0.62))] backdrop-blur-sm dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(255,255,255,0.045),rgba(255,255,255,0.03))]">
                  <div className="flex gap-4 px-5 py-5 sm:px-6">
                    <div className="w-px shrink-0 rounded-full bg-gradient-to-b from-amber-400/80 via-orange-400/55 to-transparent dark:from-amber-400/50 dark:via-orange-400/30" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold tracking-[0.24em] text-neutral-500 uppercase dark:text-neutral-400">
                        {tGuild("openNoteLabel")}
                      </p>
                      <p className="mt-2 max-w-2xl text-sm leading-[1.75] text-neutral-600 dark:text-neutral-300">
                        {tGuild.rich("openNote", {
                          bold: (chunks) => (
                            <strong className="font-semibold text-neutral-900 dark:text-white">
                              {chunks}
                            </strong>
                          ),
                        })}
                      </p>
                      <Link
                        href={PAGE_ROUTES.GUILD}
                        className="mt-3 inline-flex text-sm font-medium text-neutral-500 underline-offset-4 transition hover:text-neutral-800 hover:underline dark:text-neutral-400 dark:hover:text-white"
                      >
                        {t("dialog.learnMore")}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            <section className="grid gap-3 sm:grid-cols-2">
              {selectedTierDetails.features.slice(0, 4).map((feature) => (
                <div
                  key={feature}
                  className="rounded-2xl border border-neutral-200/80 bg-white/70 px-4 py-4 shadow-[0_14px_34px_-28px_rgba(15,23,42,0.35)] backdrop-blur-sm dark:border-white/10 dark:bg-white/5 dark:shadow-none"
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full ${colors.checkBg} shadow-sm`}
                    >
                      <CheckIcon className="h-3.5 w-3.5 text-white" />
                    </span>
                    <p className="text-sm leading-[1.6] text-neutral-700 dark:text-neutral-300">
                      {feature}
                    </p>
                  </div>
                </div>
              ))}
            </section>
          </div>

          {/* Right: tier selector + CTA */}
          <div className="w-full lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[32px] border border-white/75 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(250,250,249,0.9))] p-5 shadow-[0_24px_80px_-36px_rgba(15,23,42,0.28)] backdrop-blur-xl sm:p-6 dark:border-white/10 dark:bg-[linear-gradient(180deg,rgba(19,19,19,0.96),rgba(10,10,10,0.98))] dark:shadow-[0_24px_80px_-36px_rgba(0,0,0,0.55)]">
              <div className="mb-5 flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.24em] text-neutral-500 uppercase dark:text-neutral-400">
                    {tierLabel}
                  </p>
                  <h2 className="mt-1 text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                    {selectedTierDetails.name}
                  </h2>
                </div>
                <span
                  className={`rounded-full border px-2.5 py-1 text-[10px] font-semibold ${colors.badge}`}
                >
                  {selectedTierDetails.badge}
                </span>
              </div>

              <p className="mb-5 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {selectedTierDetails.tagline}
              </p>

              <div className="space-y-2.5">
                {BILLING_TIERS.map((tier) => (
                  <TierCard
                    key={tier}
                    tier={tier}
                    disabled={isSelectionLocked}
                    faded={isSelectionLocked && selectedTier !== tier}
                    name={tierData[tier].name}
                    badge={tierData[tier].badge}
                    price={
                      isEnabled ? tGuild("tiers.priceWithInterval", { amount: prices[tier] }) : ""
                    }
                    showPrice={isEnabled}
                    selected={selectedTier === tier}
                    onClick={() => {
                      if (!isSelectionLocked) {
                        setSelectedTier(tier);
                      }
                    }}
                  />
                ))}
              </div>

              <div className="mt-5 rounded-2xl border border-neutral-200/80 bg-neutral-50/80 p-4 dark:border-white/10 dark:bg-white/5">
                {isEnabled ? (
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium text-neutral-500 dark:text-neutral-400">
                      {tierLabel}
                    </span>
                    <span className={`text-base font-black ${colors.accent}`}>
                      {tGuild("tiers.priceWithInterval", { amount: prices[selectedTier] })}
                    </span>
                  </div>
                ) : null}
                <div className={`space-y-2 ${isEnabled ? "mt-3" : ""}`}>
                  {selectedTierDetails.features.slice(0, 3).map((feature) => (
                    <div key={feature} className="flex items-start gap-2.5">
                      <span
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${colors.checkBg}`}
                      >
                        <CheckIcon className="h-3 w-3 text-white" />
                      </span>
                      <span className="text-sm leading-[1.55] text-neutral-600 dark:text-neutral-300">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {activeError ? (
                <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                  {activeError}
                </div>
              ) : null}

              {!isEnabled ? (
                <div className="mt-4 rounded-2xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.9))] px-4 py-3 text-sm text-amber-900 shadow-[0_18px_40px_-28px_rgba(245,158,11,0.55)] dark:border-amber-400/20 dark:bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(249,115,22,0.08))] dark:text-amber-100 dark:shadow-none">
                  <p className="font-semibold">{t("disabled.title")}</p>
                  <p className="mt-1 leading-relaxed">{disabledNoticeBody}</p>
                </div>
              ) : null}

              {isEnabled && checkoutState === "canceled" ? (
                <div className="mt-4 overflow-hidden rounded-2xl border border-amber-200/80 bg-[linear-gradient(180deg,rgba(255,251,235,0.96),rgba(255,247,237,0.9))] px-4 py-3 shadow-[0_18px_40px_-28px_rgba(245,158,11,0.55)] dark:border-amber-400/20 dark:bg-[linear-gradient(180deg,rgba(251,191,36,0.12),rgba(249,115,22,0.08))] dark:shadow-none">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 h-2.5 w-2.5 shrink-0 rounded-full bg-amber-500 shadow-[0_0_0_4px_rgba(251,191,36,0.18)] dark:shadow-[0_0_0_4px_rgba(251,191,36,0.12)]" />
                    <div>
                      <p className="text-sm font-semibold text-neutral-900 dark:text-white">
                        {t("billing.checkoutCanceled")}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {isEnabled && isActivationLocked ? (
                <div className="mt-4 rounded-2xl border border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(209,250,229,0.7))] px-4 py-3 text-sm text-emerald-900 shadow-[0_18px_40px_-28px_rgba(16,185,129,0.45)] dark:border-emerald-400/20 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.12),rgba(5,150,105,0.08))] dark:text-emerald-100 dark:shadow-none">
                  {t("billing.syncing")}
                </div>
              ) : null}

              {isEnabled || showManageButton ? (
                <div className="mt-6">
                  <button
                    type="button"
                    disabled={isSubmitting || isActivationLocked}
                    onClick={handlePrimaryAction}
                    className={`w-full rounded-2xl bg-gradient-to-r py-4 text-sm font-bold text-white transition-[filter,transform,box-shadow] duration-200 hover:-translate-y-px hover:brightness-105 disabled:pointer-events-none disabled:opacity-60 ${colors.ctaGradient} ${colors.ctaGlow}`}
                  >
                    {showManageButton ? (
                      <AsyncButtonContent isPending={portalMutation.isPending}>
                        {t("billing.manageAction")}
                        <ExternalLinkIcon className="h-3.5 w-3.5" />
                      </AsyncButtonContent>
                    ) : checkoutMutation.isPending ? (
                      t("join.continuing")
                    ) : (
                      t("join.continue")
                    )}
                  </button>
                  {isEnabled ? (
                    <div className="mt-4 flex items-center justify-center gap-2 text-center text-xs text-neutral-500 dark:text-neutral-500">
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                      <span>{t("join.billingNote")}</span>
                    </div>
                  ) : null}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
