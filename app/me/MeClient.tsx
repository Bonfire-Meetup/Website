"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { BoltIcon, LogOutIcon, UserIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { ApiError } from "@/lib/api/errors";
import {
  useDeleteAccountChallengeMutation,
  useDeleteAccountMutation,
  useRemoveBoostMutation,
  useUpdatePreferenceMutation,
  useUserProfile,
} from "@/lib/api/user-profile";
import { clearAccessToken, isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { PAGE_ROUTES } from "@/lib/routes/pages";
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
} from "./ProfileSkeletons";

type DeleteStep = "idle" | "confirm" | "verify" | "done";

function getValidTokenOrNull(): string | null {
  const token = readAccessToken();
  if (!token) {
    return null;
  }
  return isAccessTokenValid(token) ? token : null;
}

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

  const [deleteStep, setDeleteStep] = useState<DeleteStep>("idle");
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteChallengeToken, setDeleteChallengeToken] = useState<string | null>(null);
  const [deleteIntent, setDeleteIntent] = useState(false);

  const [stagedCommunityEmails, setStagedCommunityEmails] = useState<boolean | null>(null);
  const [stagedPublicProfile, setStagedPublicProfile] = useState<boolean | null>(null);

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

  const profileQuery = useUserProfile();
  const updatePreferenceMutation = useUpdatePreferenceMutation();
  const removeBoostMutation = useRemoveBoostMutation();
  const deleteChallengeMutation = useDeleteAccountChallengeMutation();
  const deleteAccountMutation = useDeleteAccountMutation();

  useEffect(() => {
    const validToken = getValidTokenOrNull();
    if (validToken) {
      return;
    }

    clearAccessToken();
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    queryClient.removeQueries({ queryKey: ["video-boosts"] });
    router.replace(PAGE_ROUTES.LOGIN);
  }, [queryClient, router]);

  useEffect(() => {
    const err = profileQuery.error;
    if (err instanceof ApiError && err.status === 401) {
      clearAccessToken();
      queryClient.removeQueries({ queryKey: ["user-profile"] });
      queryClient.removeQueries({ queryKey: ["video-boosts"] });
      router.replace(PAGE_ROUTES.LOGIN);
    }
  }, [profileQuery.error, queryClient, router]);

  const profile = profileQuery.data?.profile ?? null;
  const boosts = profileQuery.data?.boosts.items ?? [];
  const attempts = profileQuery.data?.attempts.items ?? [];
  const boostAllocation = profileQuery.data?.boostAllocation ?? null;

  const loading = profileQuery.isLoading;
  const error = profileQuery.isError ? t("error") : null;

  const updatingCommunityEmails =
    stagedCommunityEmails !== null && updatePreferenceMutation.isPending;
  const updatingPublicProfile = stagedPublicProfile !== null && updatePreferenceMutation.isPending;
  const deleteLoading = deleteChallengeMutation.isPending || deleteAccountMutation.isPending;

  const handleSignOut = () => {
    clearAccessToken();
    queryClient.removeQueries({ queryKey: ["user-profile"] });
    queryClient.removeQueries({ queryKey: ["video-boosts"] });
    router.replace(PAGE_ROUTES.HOME);
  };

  const handleCommunityEmailsToggle = async () => {
    if (!profile) {
      return;
    }

    const newValue = !profile.allowCommunityEmails;
    setStagedCommunityEmails(newValue);

    try {
      await updatePreferenceMutation.mutateAsync({
        allowCommunityEmails: newValue,
      });
      setStagedCommunityEmails(null);
    } catch {
      setStagedCommunityEmails(null);
    }
  };

  const handlePublicProfileToggle = async () => {
    if (!profile) {
      return;
    }

    const newValue = !profile.publicProfile;
    setStagedPublicProfile(newValue);

    try {
      await updatePreferenceMutation.mutateAsync({
        publicProfile: newValue,
      });
      setStagedPublicProfile(null);
    } catch {
      setStagedPublicProfile(null);
    }
  };

  const handleDeleteRequest = async () => {
    if (!deleteIntent) {
      return;
    }

    try {
      const data = await deleteChallengeMutation.mutateAsync();
      setDeleteChallengeToken(data.challenge_token);
      setDeleteStep("verify");
    } catch {
      // DeleteError will show
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

      setDeleteStep("done");

      redirectTimeoutRef.current = window.setTimeout(() => {
        router.replace(PAGE_ROUTES.HOME);
      }, 3000);
    } catch (err: unknown) {
      const reason = getApiErrorReason(err);

      if (reason === "expired" || reason === "too_many_attempts") {
        setDeleteStep("confirm");
        setDeleteCode("");
        setDeleteChallengeToken(null);
      }
    }
  };

  const handleDeleteCancel = () => {
    setDeleteStep("idle");
    setDeleteCode("");
    setDeleteChallengeToken(null);
    setDeleteIntent(false);
  };

  const handleDeleteProceed = () => {
    setDeleteStep("confirm");
  };

  const handleRemoveBoost = async (shortId: string) => {
    try {
      await removeBoostMutation.mutateAsync(shortId);
    } catch {
      // Handled by mutation onError
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

  const boostsLoading = loading;
  const boostsError = profileQuery.isError ? t("boosted.error") : null;
  const attemptsLoading = loading;
  const attemptsError = profileQuery.isError ? t("attempts.error") : null;

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {t("title")}
        </h1>

        {loading ? (
          <HeaderButtonsSkeleton />
        ) : (
          <div className="flex gap-2">
            {profile && (
              <Link href={PAGE_ROUTES.USER(compressUuid(profile.id))}>
                <Button
                  variant="ghost"
                  size="sm"
                  className="group border border-neutral-200/70 bg-white/60 text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                >
                  <UserIcon className="h-4 w-4 transition-transform group-hover:scale-110" />
                  {t("viewProfile")}
                </Button>
              </Link>
            )}

            <Button
              onClick={handleSignOut}
              variant="ghost"
              size="sm"
              className="group border border-neutral-200/70 bg-white/60 text-neutral-600 shadow-sm transition hover:border-neutral-300 hover:bg-white hover:text-neutral-900 dark:border-white/10 dark:bg-white/5 dark:text-neutral-400 dark:hover:border-white/20 dark:hover:bg-white/10 dark:hover:text-neutral-200"
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

      {loading ? (
        <>
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <ProfileSkeleton />
            <GuildSkeleton />
          </div>
          <PreferencesSkeleton />
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

      {/* Support links unchanged... */}

      <DangerZoneBlock
        status={deleteStatus}
        error={deleteError}
        step={deleteStep}
        intentChecked={deleteIntent}
        loading={deleteLoading}
        code={deleteCode}
        onIntentChange={setDeleteIntent}
        onProceed={handleDeleteProceed}
        onSendCode={handleDeleteRequest}
        onCodeChange={setDeleteCode}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />
    </div>
  );
}
