"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  BoltIcon,
  LogOutIcon,
  UserIcon,
  BookmarkIcon,
  QrCodeIcon,
  CameraIcon,
  MailIcon,
} from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import {
  useDeleteAccountChallengeMutation,
  useDeleteAccountMutation,
  useUpdatePreferenceMutation,
  useUserProfile,
  useWatchlist,
} from "@/lib/api/user-profile";
import { revokeSession, setLoggingOut as setGlobalLoggingOut } from "@/lib/auth/client";
import { resetClientAuthState } from "@/lib/auth/client-session";
import { BOOST_CONFIG } from "@/lib/config/constants";
import { USER_ROLES } from "@/lib/config/roles";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { selectAuthRoles } from "@/lib/redux/selectors/authSelectors";
import {
  setAttempts,
  setBoostAllocation,
  setBoostLedger,
  setProfile,
  setWatchlist,
  updatePreferences,
  resetDelete,
  setDeleteCode,
  setDeleteChallengeToken,
  setDeleteIntent,
  setDeleteStep,
  setStagedCommunityEmails,
  setStagedPublicProfile,
  type ProfileState,
} from "@/lib/redux/slices/profileSlice";
import type { RootState } from "@/lib/redux/store";
import { LOGIN_REASON, PAGE_ROUTES } from "@/lib/routes/pages";
import { formatDayMonthUTC } from "@/lib/utils/locale";
import { logWarn } from "@/lib/utils/log-client";
import { compressUuid } from "@/lib/utils/uuid-compress";

import { BoostLedgerBlock } from "./BoostLedgerBlock";
import { DangerZoneBlock } from "./DangerZoneBlock";
import { GuildCard } from "./GuildCard";
import { LoginAttemptsBlock } from "./LoginAttemptsBlock";
import { PasskeyBlock } from "./PasskeyBlock";
import { PreferenceBlock } from "./PreferenceBlock";
import { ProfileCard } from "./ProfileCard";
import {
  GuildSkeleton,
  HeaderButtonsSkeleton,
  PreferencesSkeleton,
  ProfileSkeleton,
  ActivitySkeleton,
  SecuritySkeleton,
} from "./ProfileSkeletons";

function getApiErrorReason(err: unknown): string | null {
  if (!(err instanceof ApiError)) {
    return null;
  }
  if (!err.data || typeof err.data !== "object") {
    return null;
  }

  const maybe = err.data as { error?: unknown };
  return typeof maybe.error === "string" ? maybe.error : null;
}

export function MeClient() {
  const t = useTranslations("account");
  const tDelete = useTranslations("account.delete");
  const locale = useLocale();
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
  const userRoles = useAppSelector(selectAuthRoles);
  const profileState = useAppSelector((state) => state.profile) as ProfileState;
  const [mounted, setMounted] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const { deleteStep } = profileState;
  const { deleteChallengeToken } = profileState;
  const { deleteCode } = profileState;
  const { deleteIntent } = profileState;
  const { stagedCommunityEmails } = profileState;
  const { stagedPublicProfile } = profileState;

  const redirectTimeoutRef = useRef<number | null>(null);
  useEffect(
    () => () => {
      if (redirectTimeoutRef.current !== null) {
        window.clearTimeout(redirectTimeoutRef.current);
        redirectTimeoutRef.current = null;
      }
    },
    [],
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  const profileQuery = useUserProfile(auth.hydrated && auth.isAuthenticated);
  const watchlistQuery = useWatchlist(auth.hydrated && auth.isAuthenticated);
  const updatePreferenceMutation = useUpdatePreferenceMutation();
  const deleteChallengeMutation = useDeleteAccountChallengeMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    dispatch(setProfile(profileQuery.data.profile));
    dispatch(setBoostLedger(profileQuery.data.boostLedger.items));
    dispatch(setAttempts(profileQuery.data.attempts.items));
    dispatch(setBoostAllocation(profileQuery.data.boostAllocation ?? null));
  }, [profileQuery.data, dispatch]);

  useEffect(() => {
    if (!watchlistQuery.data) {
      return;
    }

    const videoIds = watchlistQuery.data.items.map((item) => item.videoId);
    dispatch(setWatchlist(videoIds));
  }, [watchlistQuery.data, dispatch]);

  useEffect(() => {
    if (!auth.hydrated || auth.loading) {
      return;
    }

    if (auth.isAuthenticated && auth.token) {
      return;
    }

    if (loggingOut) {
      return;
    }

    resetClientAuthState({ dispatch, queryClient });
    router.replace(PAGE_ROUTES.LOGIN);
  }, [
    auth.isAuthenticated,
    auth.token,
    auth.hydrated,
    auth.loading,
    queryClient,
    router,
    dispatch,
    loggingOut,
  ]);

  useEffect(() => {
    const err = profileQuery.error;
    if (!(err instanceof ApiError) || err.status !== 401 || loggingOut) {
      return;
    }

    resetClientAuthState({ dispatch, queryClient });
    router.replace(PAGE_ROUTES.LOGIN_WITH_REASON(LOGIN_REASON.SESSION_EXPIRED));
  }, [profileQuery.error, queryClient, router, dispatch, loggingOut]);

  const isHydrated = mounted && auth.hydrated;

  const profile = isHydrated ? (profileState.profile ?? profileQuery.data?.profile ?? null) : null;
  const isCrew = userRoles.includes(USER_ROLES.CREW);
  const isEditor = userRoles.includes(USER_ROLES.EDITOR);
  const boostLedger = isHydrated
    ? profileState.boostLedger.length
      ? profileState.boostLedger
      : (profileQuery.data?.boostLedger.items ?? [])
    : [];
  const attempts = isHydrated
    ? profileState.attempts.length
      ? profileState.attempts
      : (profileQuery.data?.attempts.items ?? [])
    : [];
  const boostAllocation = isHydrated
    ? (profileState.boostAllocation ?? profileQuery.data?.boostAllocation ?? null)
    : null;

  const loading = profileQuery.isLoading;
  const showSkeletons = !isHydrated || loading;
  const profileError = profileQuery.isError ? t("error") : null;

  const updatingCommunityEmails =
    stagedCommunityEmails !== null && updatePreferenceMutation.isPending;
  const updatingPublicProfile = stagedPublicProfile !== null && updatePreferenceMutation.isPending;
  const deleteLoading = deleteChallengeMutation.isPending || deleteAccountMutation.isPending;

  const handleSignOut = async () => {
    setLoggingOut(true);
    setGlobalLoggingOut(true);

    await revokeSession();
    resetClientAuthState({ dispatch, queryClient });
    setGlobalLoggingOut(false);

    router.replace(PAGE_ROUTES.HOME);
  };

  const handleCommunityEmailsToggle = async () => {
    if (!profile) {
      return;
    }

    const newValue = !profile.allowCommunityEmails;
    dispatch(setStagedCommunityEmails(newValue));

    try {
      await updatePreferenceMutation.mutateAsync({
        allowCommunityEmails: newValue,
      });
      dispatch(updatePreferences({ allowCommunityEmails: newValue }));
      dispatch(setStagedCommunityEmails(null));
    } catch {
      dispatch(setStagedCommunityEmails(null));
    }
  };

  const handlePublicProfileToggle = async () => {
    if (!profile) {
      return;
    }

    const newValue = !profile.publicProfile;
    dispatch(setStagedPublicProfile(newValue));

    try {
      await updatePreferenceMutation.mutateAsync({
        publicProfile: newValue,
      });
      dispatch(updatePreferences({ publicProfile: newValue }));
      dispatch(setStagedPublicProfile(null));
    } catch {
      dispatch(setStagedPublicProfile(null));
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteIntent) {
      return;
    }

    try {
      const data = await deleteChallengeMutation.mutateAsync();
      dispatch(setDeleteChallengeToken(data.challenge_token));
      dispatch(setDeleteStep("verify"));
    } catch (deleteChallengeError) {
      logWarn("account.delete_challenge_failed", { error: String(deleteChallengeError) });
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteChallengeToken) {
      return;
    }

    try {
      await deleteAccountMutation.mutateAsync({
        challengeToken: deleteChallengeToken,
        code: deleteCode,
      });

      dispatch(setDeleteStep("done"));

      redirectTimeoutRef.current = window.setTimeout(() => {
        router.replace(PAGE_ROUTES.HOME);
      }, 3000);
    } catch (err: unknown) {
      const reason = getApiErrorReason(err);

      if (reason === "expired" || reason === "too_many_attempts") {
        dispatch(setDeleteStep("confirm"));
        dispatch(setDeleteCode(""));
        dispatch(setDeleteChallengeToken(null));
      }
    }
  };

  const handleDeleteCancel = () => {
    dispatch(resetDelete());
  };

  const handleDeleteProceed = () => {
    dispatch(setDeleteStep("confirm"));
  };

  const deleteError =
    deleteChallengeMutation.isError || deleteAccountMutation.isError ? tDelete("error") : null;

  const deleteStatus =
    deleteStep === "verify"
      ? tDelete("status")
      : deleteStep === "done"
        ? tDelete("completed")
        : null;

  const boostLedgerLoading = loading || !isHydrated;
  const boostLedgerError = profileQuery.isError ? t("ledger.error") : null;
  const attemptsLoading = loading || !isHydrated;
  const attemptsError = profileQuery.isError ? t("attempts.error") : null;
  const boostCapacityLeft = boostAllocation
    ? Math.max(BOOST_CONFIG.MAX_BOOSTS - boostAllocation.availableBoosts, 0)
    : 0;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {t("title")}
        </h1>

        {showSkeletons ? (
          <HeaderButtonsSkeleton />
        ) : (
          <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto sm:flex-row sm:items-center">
            {profile && (
              <>
                <Link href={PAGE_ROUTES.USER(compressUuid(profile.id))} prefetch={false}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <UserIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("viewProfile")}
                  </Button>
                </Link>

                <Link href={PAGE_ROUTES.WATCH_LATER} prefetch={false}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <BookmarkIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("watchLater")}
                  </Button>
                </Link>

                <Link href={PAGE_ROUTES.EVENT_CHECK_IN} prefetch={false}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <QrCodeIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("checkIn")}
                  </Button>
                </Link>

                {isCrew && (
                  <Link href={PAGE_ROUTES.EVENT_READER} prefetch={false}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                    >
                      <CameraIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {t("reader")}
                    </Button>
                  </Link>
                )}

                {isEditor && (
                  <Link href={PAGE_ROUTES.NEWSLETTER_EDITOR} prefetch={false}>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                    >
                      <MailIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                      {t("newsletterEditor")}
                    </Button>
                  </Link>
                )}
              </>
            )}

            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
            >
              <LogOutIcon className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              {t("signOut")}
            </Button>
          </div>
        )}
      </div>

      {profileError && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {profileError}
        </div>
      )}

      {showSkeletons ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ProfileSkeleton />
            <GuildSkeleton />
          </div>
          <PreferencesSkeleton />
          <ActivitySkeleton />
          <SecuritySkeleton />
        </>
      ) : profile ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ProfileCard profile={profile} onProfileUpdate={() => profileQuery.refetch()} />
            <GuildCard />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("preferences.title")}
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <PreferenceBlock
                enabled={stagedCommunityEmails ?? profile.allowCommunityEmails}
                disabled={updatingCommunityEmails}
                onToggle={handleCommunityEmailsToggle}
                translationKey="communityEmails"
              />
              <PreferenceBlock
                enabled={stagedPublicProfile ?? profile.publicProfile}
                disabled={updatingPublicProfile}
                onToggle={handlePublicProfileToggle}
                translationKey="publicProfile"
              />
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("activity.title")}
            </h2>

            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <div className="min-w-0 space-y-4">
                {boostAllocation && (
                  <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-linear-to-br from-white via-emerald-50/90 to-teal-50/80 shadow-[0_16px_40px_-28px_rgba(5,150,105,0.35)] dark:border-emerald-500/25 dark:from-emerald-500/12 dark:via-emerald-500/10 dark:to-teal-500/10 dark:shadow-none">
                    <div className="flex min-h-14 flex-col items-start gap-1 border-b border-emerald-200/70 bg-white/55 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:gap-3 dark:border-emerald-500/20 dark:bg-white/[0.03]">
                      <div className="flex items-center gap-3">
                        <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-950 dark:text-emerald-200">
                          <BoltIcon
                            className="h-4 w-4 shrink-0 text-emerald-700/80 dark:text-emerald-300/80"
                            aria-hidden="true"
                          />
                          {t("boostAllocation.title")}
                        </h3>
                      </div>
                      <div className="text-[11px] font-medium text-emerald-700/80 sm:ml-auto sm:text-right dark:text-emerald-300/80">
                        {t("boostAllocation.nextAllocation", {
                          date: formatDayMonthUTC(boostAllocation.nextAllocationDate, locale),
                        })}
                      </div>
                    </div>
                    <div className="p-4">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                        <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="text-3xl font-black text-emerald-700 dark:text-emerald-300">
                            {boostAllocation.availableBoosts}
                          </span>
                          <span className="text-sm font-medium text-emerald-800 dark:text-emerald-300">
                            {boostAllocation.availableBoosts === 1
                              ? t("boostAllocation.availableOne")
                              : t("boostAllocation.available", {
                                  count: boostAllocation.availableBoosts,
                                })}
                          </span>
                        </div>
                        <div className="self-start rounded-full border border-emerald-200/80 bg-white/70 px-2.5 py-1 text-[11px] font-semibold tracking-[0.16em] text-emerald-700 uppercase shadow-sm shadow-emerald-100/70 dark:border-emerald-500/20 dark:bg-white/8 dark:text-emerald-300 dark:shadow-none">
                          {boostCapacityLeft === 0
                            ? t("boostAllocation.atCap")
                            : t("boostAllocation.roomLeft", { count: boostCapacityLeft })}
                        </div>
                      </div>
                      <div className="mt-3 rounded-xl border border-emerald-200/70 bg-white/55 px-3 py-2 dark:border-emerald-500/15 dark:bg-white/[0.04]">
                        <p className="text-xs leading-5 text-emerald-700/80 dark:text-emerald-300/75">
                          {t("boostAllocation.limitNote")}
                        </p>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-emerald-100/90 dark:bg-emerald-500/15">
                        <div
                          className="h-full rounded-full bg-linear-to-r from-emerald-500 via-emerald-400 to-teal-400 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-300"
                          style={{
                            width: `${Math.min(
                              (boostAllocation.availableBoosts / BOOST_CONFIG.MAX_BOOSTS) * 100,
                              100,
                            )}%`,
                          }}
                        />
                      </div>
                      <div className="mt-1 text-[11px] text-emerald-600/75 dark:text-emerald-300/70">
                        {boostAllocation.availableBoosts}/{BOOST_CONFIG.MAX_BOOSTS}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="min-w-0">
                <BoostLedgerBlock
                  loading={boostLedgerLoading}
                  error={boostLedgerError}
                  items={boostLedger}
                  onRefresh={() => profileQuery.refetch()}
                  refreshing={profileQuery.isFetching}
                />
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
              {t("security.title")}
            </h2>
            <div className="grid min-w-0 gap-6 lg:grid-cols-2">
              <div className="min-w-0">
                <LoginAttemptsBlock
                  items={attempts}
                  loading={attemptsLoading}
                  error={attemptsError}
                />
              </div>
              <div className="min-w-0">
                <PasskeyBlock />
              </div>
            </div>
          </div>
        </>
      ) : null}

      <DangerZoneBlock
        status={deleteStatus}
        error={deleteError}
        step={deleteStep}
        intentChecked={deleteIntent}
        loading={deleteLoading}
        code={deleteCode}
        onIntentChange={(value) => dispatch(setDeleteIntent(value))}
        onProceed={handleDeleteProceed}
        onSendCode={handleDeleteRequest}
        onCodeChange={(value) => dispatch(setDeleteCode(value))}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
