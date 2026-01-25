"use client";

import type { RootState } from "@/lib/redux/store";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import {
  BoltIcon,
  LogOutIcon,
  UserIcon,
  BookmarkIcon,
  QrCodeIcon,
} from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import {
  useDeleteAccountChallengeMutation,
  useDeleteAccountMutation,
  useRemoveBoostMutation,
  useUpdatePreferenceMutation,
  useUserProfile,
  useWatchlist,
} from "@/lib/api/user-profile";
import { clearAccessToken, revokeSession } from "@/lib/auth/client";
import { useAppDispatch, useAppSelector } from "@/lib/redux/hooks";
import { clearAuth } from "@/lib/redux/slices/authSlice";
import {
  clearProfile,
  removeBoost as removeBoostAction,
  setAttempts,
  setBoostAllocation,
  setBoosts,
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
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { logWarn } from "@/lib/utils/log-client";
import { compressUuid } from "@/lib/utils/uuid-compress";

import { BoostedVideosBlock } from "./BoostedVideosBlock";
import { DangerZoneBlock } from "./DangerZoneBlock";
import { GuildCard } from "./GuildCard";
import { LoginAttemptsBlock } from "./LoginAttemptsBlock";
import { PreferenceBlock } from "./PreferenceBlock";
import { ProfileCard } from "./ProfileCard";
import {
  GuildSkeleton,
  HeaderButtonsSkeleton,
  PreferencesSkeleton,
  ProfileSkeleton,
  ActivitySkeleton,
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const dispatch = useAppDispatch();
  const auth = useAppSelector((state) => state.auth) as RootState["auth"];
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

  const profileQuery = useUserProfile();
  const watchlistQuery = useWatchlist();
  const updatePreferenceMutation = useUpdatePreferenceMutation();
  const removeBoostMutation = useRemoveBoostMutation();
  const deleteChallengeMutation = useDeleteAccountChallengeMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  useEffect(() => {
    if (!profileQuery.data) {
      return;
    }

    dispatch(setProfile(profileQuery.data.profile));
    dispatch(setBoosts(profileQuery.data.boosts.items));
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
    if (!auth.hydrated) {
      return;
    }

    if (auth.isAuthenticated && auth.token) {
      return;
    }

    if (loggingOut) {
      return;
    }

    dispatch(clearAuth());
    dispatch(clearProfile());
    clearAccessToken();
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    queryClient.removeQueries({ queryKey: ["video-boosts"] });
    queryClient.removeQueries({ queryKey: ["watchlist"] });
    queryClient.removeQueries({ queryKey: ["video-watchlist"] });
    router.replace(PAGE_ROUTES.LOGIN);
  }, [auth.isAuthenticated, auth.token, auth.hydrated, queryClient, router, dispatch, loggingOut]);

  useEffect(() => {
    const err = profileQuery.error;
    if (err instanceof ApiError && err.status === 401) {
      if (loggingOut) {
        return;
      }
      dispatch(clearAuth());
      dispatch(clearProfile());
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["video-boosts"] });
      queryClient.removeQueries({ queryKey: ["watchlist"] });
      queryClient.removeQueries({ queryKey: ["video-watchlist"] });
      router.replace(PAGE_ROUTES.LOGIN);
    }
  }, [profileQuery.error, queryClient, router, dispatch, loggingOut]);

  const isHydrated = mounted && auth.hydrated;

  const profile = isHydrated ? (profileState.profile ?? profileQuery.data?.profile ?? null) : null;
  const boosts = isHydrated
    ? profileState.boosts.length
      ? profileState.boosts
      : (profileQuery.data?.boosts.items ?? [])
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
  const error = profileQuery.isError ? t("error") : null;

  const updatingCommunityEmails =
    stagedCommunityEmails !== null && updatePreferenceMutation.isPending;
  const updatingPublicProfile = stagedPublicProfile !== null && updatePreferenceMutation.isPending;
  const deleteLoading = deleteChallengeMutation.isPending || deleteAccountMutation.isPending;

  const handleSignOut = async () => {
    setLoggingOut(true);

    await revokeSession();
    dispatch(clearAuth());
    dispatch(clearProfile());
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    queryClient.removeQueries({ queryKey: ["video-boosts"] });
    queryClient.removeQueries({ queryKey: ["watchlist"] });
    queryClient.removeQueries({ queryKey: ["video-watchlist"] });

    router.replace(PAGE_ROUTES.LOGIN);
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
    } catch (error) {
      logWarn("account.delete_challenge_failed", { error: String(error) });
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

  const handleRemoveBoost = async (shortId: string) => {
    try {
      await removeBoostMutation.mutateAsync(shortId);
      dispatch(removeBoostAction(shortId));
    } catch (error) {
      logWarn("profile.remove_boost_failed", { error: String(error), shortId });
    }
  };

  const deleteError =
    deleteChallengeMutation.isError || deleteAccountMutation.isError ? tDelete("error") : null;

  const deleteStatus =
    deleteStep === "verify"
      ? tDelete("status")
      : deleteStep === "done"
        ? tDelete("completed")
        : null;

  const boostsLoading = loading || !isHydrated;
  const boostsError = profileQuery.isError ? t("boosted.error") : null;
  const attemptsLoading = loading || !isHydrated;
  const attemptsError = profileQuery.isError ? t("attempts.error") : null;

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
                <Link href={PAGE_ROUTES.USER(compressUuid(profile.id))}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <UserIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("viewProfile")}
                  </Button>
                </Link>

                <Link href={PAGE_ROUTES.WATCH_LATER}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <BookmarkIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("watchLater")}
                  </Button>
                </Link>

                <Link href={PAGE_ROUTES.ME_CHECK_IN}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="group h-14 w-full justify-center gap-2 border border-neutral-200/70 bg-white/60 px-4 text-base text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 sm:h-auto sm:w-auto sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  >
                    <QrCodeIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                    {t("checkIn")}
                  </Button>
                </Link>
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

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {error}
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
        </>
      ) : null}

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {t("activity.title")}
        </h2>

        <div className="grid min-w-0 gap-6 lg:grid-cols-2">
          <div className="min-w-0 space-y-4">
            {boostAllocation && (
              <div className="overflow-hidden rounded-2xl border border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 dark:border-emerald-500/30 dark:from-emerald-500/10 dark:to-teal-500/10">
                <div className="border-b border-emerald-100 px-4 py-3 dark:border-emerald-500/20">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="flex items-center gap-2 text-sm font-semibold text-emerald-900 dark:text-emerald-200">
                      <BoltIcon
                        className="h-4 w-4 shrink-0 text-emerald-700/80 dark:text-emerald-300/80"
                        aria-hidden="true"
                      />
                      {t("boostAllocation.title")}
                    </h3>
                    <div className="text-right text-[11px] font-normal text-emerald-700/80 sm:shrink-0 dark:text-emerald-300/80">
                      {t("boostAllocation.nextAllocation", {
                        date: new Date(boostAllocation.nextAllocationDate).toLocaleDateString(
                          undefined,
                          { day: "numeric", month: "long" },
                        ),
                      })}
                    </div>
                  </div>
                </div>
                <div className="p-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-emerald-600 dark:text-emerald-300">
                      {boostAllocation.availableBoosts}
                    </span>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {boostAllocation.availableBoosts === 1
                        ? t("boostAllocation.availableOne")
                        : t("boostAllocation.available", {
                            count: boostAllocation.availableBoosts,
                          })}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-emerald-600/70 dark:text-emerald-300/70">
                    {t("boostAllocation.limitNote")}
                  </p>
                </div>
              </div>
            )}

            <BoostedVideosBlock
              loading={boostsLoading}
              error={boostsError}
              items={boosts}
              onRemove={handleRemoveBoost}
            />
          </div>

          <div className="min-w-0">
            <LoginAttemptsBlock items={attempts} loading={attemptsLoading} error={attemptsError} />
          </div>
        </div>
      </div>

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
