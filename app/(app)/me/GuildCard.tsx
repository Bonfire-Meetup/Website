"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { CheckIcon, ExternalLinkIcon, GuildIcon } from "@/components/shared/Icons";
import { AsyncButtonContent } from "@/components/ui/AsyncButtonContent";
import { Button } from "@/components/ui/Button";
import {
  GUILD_SUBSCRIPTION_QUERY_KEY,
  syncGuildSubscriptionCheckout,
  useCreateGuildPortalMutation,
  useGuildSubscription,
  useSyncGuildSubscriptionMutation,
} from "@/lib/api/subscription";
import { refreshAuthTokens } from "@/lib/auth/client";
import { clearGuildActivationLock, readGuildActivationLock } from "@/lib/billing/guild-activation";
import { getGuildTierCopy, getGuildTierName } from "@/lib/billing/guild-tier-copy";
import {
  GUILD_TIER_FLAME_WASH_CLASS,
  GUILD_TIER_MEMBER_CARD_STYLES,
} from "@/lib/billing/guild-tier-styles";
import { PAGE_ROUTES } from "@/lib/routes/pages";

interface GuildCardProps {
  currentMembershipTier: number | null;
  isEnabled: boolean;
}

const REFRESH_MEMBERSHIP_BUTTON_CLASS =
  "h-auto min-h-0 shrink-0 rounded-md border border-neutral-200/60 bg-white/55 px-1.5! py-0.5! text-[11px]! font-normal leading-tight text-neutral-500/85 shadow-none hover:border-neutral-300/80 hover:bg-white/85 hover:text-neutral-700 dark:border-white/12 dark:bg-white/[0.08] dark:text-neutral-400/90 dark:hover:border-white/18 dark:hover:bg-white/[0.12] dark:hover:text-neutral-300 active:scale-[0.99]";

function SyncNotice({ message }: { message: string }) {
  return (
    <div className="rounded-2xl border border-emerald-200/80 bg-[linear-gradient(180deg,rgba(236,253,245,0.95),rgba(209,250,229,0.7))] p-3.5 text-emerald-900 shadow-[0_18px_42px_-30px_rgba(16,185,129,0.45)] dark:border-emerald-400/20 dark:bg-[linear-gradient(180deg,rgba(16,185,129,0.14),rgba(5,150,105,0.08))] dark:text-emerald-100 dark:shadow-none">
      <div className="flex items-start gap-3">
        <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-emerald-500 shadow-[0_0_0_4px_rgba(16,185,129,0.16)] dark:shadow-[0_0_0_4px_rgba(16,185,129,0.12)]" />
        <div className="min-w-0 flex-1">
          <p className="text-sm leading-relaxed font-medium">{message}</p>
          <div className="mt-3 overflow-hidden rounded-full bg-emerald-950/10 dark:bg-white/10">
            <div className="relative h-2 w-full">
              <div className="absolute inset-y-0 left-0 w-full bg-gradient-to-r from-emerald-200/80 via-emerald-300/70 to-emerald-200/80 dark:from-emerald-400/20 dark:via-emerald-300/25 dark:to-emerald-400/20" />
              <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-r from-transparent via-white/70 to-transparent dark:via-white/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function formatMoney(locale: string, amount: number, currency: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency.toUpperCase(),
  }).format(amount / 100);
}

function formatDate(locale: string, value: string | null) {
  if (!value) {
    return null;
  }

  return new Intl.DateTimeFormat(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function GuildCard({ currentMembershipTier, isEnabled }: GuildCardProps) {
  const t = useTranslations("account.guild");
  const tGuild = useTranslations("guildPage");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const [syncingCheckout, setSyncingCheckout] = useState(false);

  const subscriptionQuery = useGuildSubscription(true);
  const { refetch } = subscriptionQuery;
  const portalMutation = useCreateGuildPortalMutation();
  const syncMutation = useSyncGuildSubscriptionMutation();

  const checkoutState = searchParams.get("checkout-state");
  const checkoutSessionId = searchParams.get("guild-checkout-session-id");
  const isCheckoutReturning = checkoutState === "success";
  const [hasActivationLock, setHasActivationLock] = useState(
    () => readGuildActivationLock() !== null,
  );
  const shouldSyncActivation = isCheckoutReturning || hasActivationLock;

  useEffect(() => {
    if (!isEnabled) {
      setSyncingCheckout(false);
      return;
    }

    if (!shouldSyncActivation) {
      setSyncingCheckout(false);
      return;
    }

    setSyncingCheckout(true);
    let attempts = 0;
    let cancelled = false;

    const poll = async () => {
      attempts += 1;

      if (checkoutSessionId) {
        try {
          await syncGuildSubscriptionCheckout(checkoutSessionId);
        } catch {
          // Keep polling the summary; webhook delivery may still resolve separately.
        }
      }

      const result = await refetch();
      const summary = result.data;

      if (cancelled) {
        return;
      }

      if (summary?.isActive && summary.tier && summary.tier !== currentMembershipTier) {
        clearGuildActivationLock();
        setHasActivationLock(false);
        await refreshAuthTokens();
        await queryClient.invalidateQueries({ queryKey: GUILD_SUBSCRIPTION_QUERY_KEY });
        router.replace(PAGE_ROUTES.ME, { scroll: false });
        return;
      }

      if (summary?.isActive && summary.tier && currentMembershipTier === summary.tier) {
        clearGuildActivationLock();
        setHasActivationLock(false);
        setSyncingCheckout(false);
        router.replace(PAGE_ROUTES.ME, { scroll: false });
        return;
      }

      if (attempts < 10) {
        window.setTimeout(poll, 2000);
        return;
      }

      setSyncingCheckout(false);
    };

    poll().catch(() => {
      setSyncingCheckout(false);
    });

    return () => {
      cancelled = true;
    };
  }, [
    checkoutSessionId,
    currentMembershipTier,
    isEnabled,
    queryClient,
    refetch,
    router,
    shouldSyncActivation,
  ]);

  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    if (checkoutState === "canceled") {
      clearGuildActivationLock();
      setHasActivationLock(false);
      return;
    }

    if (subscriptionQuery.data?.isActive) {
      clearGuildActivationLock();
      setHasActivationLock(false);
      return;
    }

    const syncLock = () => {
      setHasActivationLock(readGuildActivationLock() !== null);
    };

    window.addEventListener("storage", syncLock);
    window.addEventListener("focus", syncLock);

    return () => {
      window.removeEventListener("storage", syncLock);
      window.removeEventListener("focus", syncLock);
    };
  }, [checkoutState, isEnabled, subscriptionQuery.data?.isActive]);

  const summary = subscriptionQuery.data;
  const guildTiers = getGuildTierCopy(tGuild);
  const hasActiveSubscription = Boolean(summary?.isActive);
  const activeTier = (summary?.tier ?? currentMembershipTier) as 1 | 2 | 3 | null;
  const activeTierStyle = activeTier ? GUILD_TIER_MEMBER_CARD_STYLES[activeTier] : null;
  const activeTierDetails = activeTier ? guildTiers[activeTier] : null;
  const activeTierName = getGuildTierName(guildTiers, activeTier);
  const activeTierFeatures = activeTierDetails?.features ?? [];
  const activeTierTagline = activeTierDetails?.tagline ?? null;

  const flameTier: 0 | 1 | 2 | 3 = (() => {
    if (!hasActiveSubscription) {
      return 0;
    }
    if (activeTier === 1 || activeTier === 2 || activeTier === 3) {
      return activeTier;
    }
    return 1;
  })();

  const flameWashClass = GUILD_TIER_FLAME_WASH_CLASS[flameTier];

  let upcomingChargeLabel: string | null = null;
  if (summary?.upcomingCharge) {
    const dueAt = formatDate(locale, summary.upcomingCharge.dueAt ?? null);
    const amount = formatMoney(
      locale,
      summary.upcomingCharge.amount,
      summary.upcomingCharge.currency,
    );

    upcomingChargeLabel = dueAt
      ? t("billing.upcomingChargeValue", { amount, date: dueAt })
      : amount;
  }

  const currentPeriodEndLabel = formatDate(locale, summary?.currentPeriodEnd ?? null);
  let scheduledChangeLabel: string | null = null;
  if (summary?.scheduledChange && activeTier) {
    const targetTierName = guildTiers[summary.scheduledChange.tier].name;
    const effectiveAt = formatDate(locale, summary.scheduledChange.effectiveAt);

    if (effectiveAt) {
      scheduledChangeLabel = t("billing.scheduledChange", {
        date: effectiveAt,
        direction:
          summary.scheduledChange.tier < activeTier
            ? t("billing.scheduledChangeDowngrade")
            : t("billing.scheduledChangeUpgrade"),
        tier: targetTierName,
      });
    }
  }

  const openPortal = async () => {
    const response = await portalMutation.mutateAsync();
    window.location.assign(response.url);
  };

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border bg-linear-to-br shadow-[0_16px_40px_-28px_rgba(251,146,60,0.35)] dark:shadow-none ${
        activeTierStyle
          ? activeTierStyle.body
          : "border-amber-200/70 from-white via-amber-50/70 to-rose-50/80 dark:border-amber-400/20 dark:from-amber-500/10 dark:via-orange-500/8 dark:to-rose-500/8"
      }`}
    >
      {/* Tier accent stripe */}
      {hasActiveSubscription && activeTierStyle && (
        <div
          className={`absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r opacity-80 ${activeTierStyle.stripe}`}
        />
      )}

      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-0 h-24 bg-gradient-to-t to-transparent ${
          activeTierStyle
            ? activeTierStyle.glow
            : "from-amber-200/35 via-orange-200/10 dark:from-amber-500/12 dark:via-orange-500/6"
        }`}
      />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1] h-32 overflow-hidden opacity-95">
        <div className={`absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t ${flameWashClass}`} />
        <div className="guild-fireplace-compact" data-guild-flame-tier={flameTier}>
          <div className="guild-flame guild-flame-compact-4" />
          <div className="guild-flame guild-flame-compact-2" />
          <div className="guild-flame guild-flame-compact-1" />
          <div className="guild-flame guild-flame-compact-3" />
          <div className="guild-flame guild-flame-compact-5" />
          <div className="guild-flame guild-flame-compact-core" />
          <div className="guild-flame-tongue guild-flame-tongue-compact-1" />
          <div className="guild-flame-tongue guild-flame-tongue-compact-2" />
          <div className="guild-flame-tongue guild-flame-tongue-compact-3" />
        </div>
      </div>

      <div
        className={`relative z-[2] flex h-full flex-col px-4 py-4 ${hasActiveSubscription ? "gap-3 pt-5" : "gap-4 px-5 py-5"}`}
      >
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-300/50 bg-white/70 px-2.5 py-1 text-[11px] font-bold tracking-[0.18em] text-amber-800 uppercase dark:border-amber-300/20 dark:bg-white/8 dark:text-amber-200">
            <GuildIcon className="h-3 w-3" />
            {t("kicker")}
          </div>
          {hasActiveSubscription && (
            <div
              className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.12em] uppercase ${
                activeTierStyle?.badge ??
                "border-emerald-200/70 bg-emerald-50/80 text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-300"
              }`}
            >
              {t("billing.statusActive")}
            </div>
          )}
        </div>

        {!isEnabled && !hasActiveSubscription ? (
          <>
            <div>
              <div className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {t("disabled.title")}
              </div>
              <p className="mt-1 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                {t("disabled.body")}
              </p>
            </div>

            <ul className="space-y-1.5">
              {(t.raw("perks") as string[]).slice(0, 3).map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs leading-snug text-neutral-700 dark:text-neutral-300">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>

            <div className="flex-1" />

            <div className="border-t border-black/8 pt-3 dark:border-white/10">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                  {t("disabled.badge")}
                </span>

                <Button href={PAGE_ROUTES.GUILD} variant="ghost" size="sm">
                  {t("learnMore")}
                </Button>
              </div>
            </div>
          </>
        ) : hasActiveSubscription ? (
          <>
            {/* Tier name + tagline */}
            <div>
              <div
                className={`text-xl font-black tracking-tight ${activeTierStyle?.title ?? "text-neutral-900 dark:text-white"}`}
              >
                {activeTierName ??
                  t("billing.activeTitle", { tier: summary?.tier ?? currentMembershipTier ?? 1 })}
              </div>
              {activeTierTagline && (
                <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                  {activeTierTagline}
                </p>
              )}
            </div>

            {/* Benefits check-list */}
            {activeTierFeatures.length > 0 && (
              <ul className="space-y-1.5">
                {activeTierFeatures.slice(0, 3).map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <CheckIcon
                      className={`mt-0.5 h-3.5 w-3.5 shrink-0 ${activeTierStyle?.check ?? "text-neutral-600 dark:text-neutral-400"}`}
                    />
                    <span className="text-xs leading-snug text-neutral-700 dark:text-neutral-300">
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="flex-1" />

            {/* Cancel / scheduled notices */}
            {summary?.cancelAtPeriodEnd && currentPeriodEndLabel ? (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-300/25 dark:bg-amber-500/10 dark:text-amber-100">
                {t("billing.cancelAtPeriodEnd", { date: currentPeriodEndLabel })}
              </div>
            ) : null}

            {scheduledChangeLabel ? (
              <div className="rounded-xl border border-black/8 bg-white/55 px-3 py-2 text-xs text-neutral-700 dark:border-white/10 dark:bg-white/6 dark:text-neutral-300">
                {scheduledChangeLabel}
              </div>
            ) : null}

            {!isEnabled ? (
              <div className="rounded-xl border border-amber-300/50 bg-amber-50/80 px-3 py-2 text-xs text-amber-900 dark:border-amber-300/25 dark:bg-amber-500/10 dark:text-amber-100">
                {t("disabled.activeNotice")}
              </div>
            ) : null}

            {/* Billing details */}
            {summary && (
              <div
                className={`space-y-0.5 border-t pt-2 ${activeTierStyle?.divider ?? "border-black/8 dark:border-white/10"}`}
              >
                <div className="flex items-baseline gap-1.5 text-xs">
                  <span className="text-neutral-400 dark:text-neutral-500">
                    {t("billing.renewal")}:
                  </span>
                  <span className="font-medium text-neutral-600 dark:text-neutral-400">
                    {currentPeriodEndLabel ?? t("billing.notAvailable")}
                  </span>
                </div>
                {upcomingChargeLabel && !summary.cancelAtPeriodEnd ? (
                  <div className="flex items-baseline gap-1.5 text-xs">
                    <span className="text-neutral-400 dark:text-neutral-500">
                      {t("billing.upcomingCharge")}:
                    </span>
                    <span className="font-medium text-neutral-600 dark:text-neutral-400">
                      {upcomingChargeLabel}
                    </span>
                  </div>
                ) : null}
              </div>
            )}

            {/* Portal error */}
            {portalMutation.isError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {t("errors.generic")}
              </div>
            ) : null}

            {/* Manage CTA */}
            <div className="flex flex-wrap items-center gap-3">
              <Button
                onClick={() => {
                  openPortal().catch(() => undefined);
                }}
                variant="primary"
                size="sm"
                className={`min-w-[152px] ${activeTierStyle?.button ?? ""}`}
              >
                <AsyncButtonContent isPending={portalMutation.isPending}>
                  {t("billing.manageAction")}
                  <ExternalLinkIcon className="h-3.5 w-3.5" />
                </AsyncButtonContent>
              </Button>

              {!shouldSyncActivation && !syncingCheckout && (
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  disabled={syncMutation.isPending}
                  onClick={() => {
                    syncMutation.mutate(checkoutSessionId ? { checkoutSessionId } : undefined);
                  }}
                  className={REFRESH_MEMBERSHIP_BUTTON_CLASS}
                >
                  {syncMutation.isPending
                    ? t("billing.refreshingAction")
                    : t("billing.refreshAction")}
                </Button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Non-active: motivating layout */}
            <div>
              <div className="text-xl font-black tracking-tight text-neutral-900 dark:text-white">
                {t("title")}
              </div>
              <p className="mt-0.5 text-xs text-neutral-500 dark:text-neutral-400">
                {t("join.subtitle")}
              </p>
            </div>

            {/* Key perks */}
            <ul className="space-y-1.5">
              {(t.raw("perks") as string[]).slice(0, 3).map((perk) => (
                <li key={perk} className="flex items-start gap-2">
                  <CheckIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500 dark:text-amber-400" />
                  <span className="text-xs leading-snug text-neutral-700 dark:text-neutral-300">
                    {perk}
                  </span>
                </li>
              ))}
            </ul>

            {/* Tier chips */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="rounded-full border border-sky-200/80 bg-sky-50/80 px-2 py-0.5 text-[10px] font-semibold text-sky-700 dark:border-sky-500/20 dark:bg-sky-500/10 dark:text-sky-300">
                {guildTiers[1].name}
              </span>
              <span className="text-[10px] text-neutral-300 dark:text-neutral-600">·</span>
              <span className="rounded-full border border-amber-200/80 bg-amber-50/80 px-2 py-0.5 text-[10px] font-semibold text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300">
                {guildTiers[2].name}
              </span>
              <span className="text-[10px] text-neutral-300 dark:text-neutral-600">·</span>
              <span className="rounded-full border border-rose-200/80 bg-rose-50/80 px-2 py-0.5 text-[10px] font-semibold text-rose-700 dark:border-rose-500/20 dark:bg-rose-500/10 dark:text-rose-300">
                {guildTiers[3].name}
              </span>
            </div>

            <div className="flex-1" />

            {/* Portal error */}
            {portalMutation.isError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-300">
                {t("errors.generic")}
              </div>
            ) : null}

            {/* CTAs + refresh — kept as one bottom block */}
            {!shouldSyncActivation && !syncingCheckout ? (
              <div className="flex flex-wrap items-center gap-3">
                {isEnabled ? (
                  <Button
                    href={PAGE_ROUTES.ME_GUILD_JOIN()}
                    variant="primary"
                    size="sm"
                    className="border-amber-300/40 from-amber-500 via-orange-500 to-amber-600 hover:border-amber-300/55 hover:shadow-[0_18px_34px_-16px_rgba(251,146,60,0.34)] dark:border-amber-300/25 dark:hover:border-amber-300/38"
                  >
                    {t("billing.subscribeAction")}
                  </Button>
                ) : (
                  <span className="inline-flex items-center rounded-full border border-amber-200/80 bg-amber-50/80 px-2.5 py-1 text-[11px] font-semibold text-amber-900 dark:border-amber-400/20 dark:bg-amber-500/10 dark:text-amber-100">
                    {t("disabled.badge")}
                  </span>
                )}
                <Button href={PAGE_ROUTES.GUILD} variant="ghost" size="sm">
                  {t("learnMore")}
                </Button>
                <Button
                  type="button"
                  variant="plain"
                  size="sm"
                  disabled={syncMutation.isPending}
                  onClick={() => {
                    syncMutation.mutate(checkoutSessionId ? { checkoutSessionId } : undefined);
                  }}
                  className={REFRESH_MEMBERSHIP_BUTTON_CLASS}
                >
                  {syncMutation.isPending
                    ? t("billing.refreshingAction")
                    : t("billing.refreshAction")}
                </Button>
              </div>
            ) : null}
          </>
        )}

        {/* Status notices — shown in both states */}
        {checkoutState === "canceled" ? (
          <div className="rounded-xl border border-neutral-200/80 bg-white/70 px-3 py-2 text-xs text-neutral-700 dark:border-white/10 dark:bg-white/6 dark:text-neutral-300">
            {t("billing.checkoutCanceled")}
          </div>
        ) : null}
        {shouldSyncActivation || syncingCheckout ? (
          <SyncNotice message={t("billing.syncing")} />
        ) : null}
      </div>
    </div>
  );
}
