"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { LogOutIcon } from "@/components/shared/icons";
import { Button } from "@/components/ui/Button";
import { clearAccessToken, isAccessTokenValid, readAccessToken } from "@/lib/auth/client";
import { createAuthHeaders, createJsonAuthHeaders } from "@/lib/utils/http";
import { API_ROUTES } from "@/lib/api/routes";
import { PAGE_ROUTES } from "@/lib/routes/pages";
import { BoostedVideosBlock } from "./BoostedVideosBlock";
import { DangerZoneBlock } from "./DangerZoneBlock";
import { PreferenceBlock } from "./PreferenceBlock";
import { LoginAttemptsBlock } from "./LoginAttemptsBlock";
import { ProfileCard } from "./ProfileCard";
import { GuildCard } from "./GuildCard";
import { ProfileSkeleton, GuildSkeleton } from "./ProfileSkeletons";

type Profile = {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  allowCommunityEmails: boolean;
};

type BoostedRecording = {
  shortId: string;
  title: string;
  speaker: string[];
  date: string;
  slug: string;
};

type LoginAttempt = {
  id: string;
  outcome: string;
  createdAt: string;
};

export function MeClient() {
  const t = useTranslations("account");
  const tDelete = useTranslations("account.delete");
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [boosts, setBoosts] = useState<BoostedRecording[]>([]);
  const [boostsLoading, setBoostsLoading] = useState(true);
  const [boostsError, setBoostsError] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<LoginAttempt[]>([]);
  const [attemptsLoading, setAttemptsLoading] = useState(true);
  const [attemptsError, setAttemptsError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [updatingPreference, setUpdatingPreference] = useState(false);
  const [deleteStep, setDeleteStep] = useState<"idle" | "confirm" | "verify" | "done">("idle");
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteStatus, setDeleteStatus] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleteCode, setDeleteCode] = useState("");
  const [deleteChallengeToken, setDeleteChallengeToken] = useState<string | null>(null);
  const [deleteIntent, setDeleteIntent] = useState(false);

  useEffect(() => {
    const token = readAccessToken();
    if (!token || !isAccessTokenValid(token)) {
      clearAccessToken();
      router.replace(PAGE_ROUTES.LOGIN);
      return;
    }
    setAccessToken(token);

    const loadAll = async () => {
      try {
        const response = await fetch(API_ROUTES.ME.BASE, {
          headers: createAuthHeaders(token),
        });

        if (!response.ok) {
          clearAccessToken();
          router.replace(PAGE_ROUTES.LOGIN);
          return;
        }

        const data = (await response.json()) as {
          profile: Profile;
          boosts: { items: BoostedRecording[] };
          attempts: { items: LoginAttempt[] };
        };

        setProfile(data.profile);
        setBoosts(data.boosts.items ?? []);
        setAttempts(data.attempts.items ?? []);
        setLoading(false);
        setBoostsLoading(false);
        setAttemptsLoading(false);
      } catch {
        setError(t("error"));
        setBoostsError(t("boosted.error"));
        setAttemptsError(t("attempts.error"));
        setLoading(false);
        setBoostsLoading(false);
        setAttemptsLoading(false);
      }
    };

    loadAll();
  }, [router, t]);

  const handleSignOut = () => {
    clearAccessToken();
    router.replace(PAGE_ROUTES.HOME);
  };

  const handleCommunityEmailsToggle = async () => {
    if (!accessToken || !profile) return;
    const nextValue = !profile.allowCommunityEmails;
    setProfile({ ...profile, allowCommunityEmails: nextValue });
    setUpdatingPreference(true);
    try {
      const response = await fetch(API_ROUTES.ME.PREFERENCES, {
        method: "PATCH",
        headers: createJsonAuthHeaders(accessToken),
        body: JSON.stringify({ allowCommunityEmails: nextValue }),
      });
      if (!response.ok) {
        setProfile({ ...profile, allowCommunityEmails: !nextValue });
      }
    } catch {
      setProfile({ ...profile, allowCommunityEmails: !nextValue });
    } finally {
      setUpdatingPreference(false);
    }
  };

  const handleDeleteRequest = async () => {
    if (!accessToken) return;
    if (!deleteIntent) {
      setDeleteError(tDelete("intentRequired"));
      return;
    }
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteStatus(null);

    try {
      const response = await fetch(API_ROUTES.ME.DELETE_CHALLENGE, {
        method: "POST",
        headers: createAuthHeaders(accessToken),
      });
      if (!response.ok) {
        setDeleteError(tDelete("error"));
        setDeleteLoading(false);
        return;
      }
      const data = (await response.json()) as { challenge_token?: string };
      if (!data.challenge_token) {
        setDeleteError(tDelete("error"));
        setDeleteLoading(false);
        return;
      }
      setDeleteChallengeToken(data.challenge_token);
      setDeleteStep("verify");
      setDeleteStatus(tDelete("status"));
    } catch {
      setDeleteError(tDelete("error"));
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!accessToken || !deleteChallengeToken) return;
    setDeleteLoading(true);
    setDeleteError(null);
    setDeleteStatus(null);

    try {
      const response = await fetch(API_ROUTES.ME.DELETE, {
        method: "POST",
        headers: createJsonAuthHeaders(accessToken),
        body: JSON.stringify({ code: deleteCode, challenge_token: deleteChallengeToken }),
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        const reason = data?.error;
        if (reason === "expired") {
          setDeleteError(tDelete("expired"));
          setDeleteStep("confirm");
          setDeleteCode("");
          setDeleteChallengeToken(null);
          setDeleteStatus(null);
        } else if (reason === "too_many_attempts") {
          setDeleteError(tDelete("tooManyAttempts"));
          setDeleteStep("confirm");
          setDeleteCode("");
          setDeleteChallengeToken(null);
          setDeleteStatus(null);
        } else if (reason === "invalid_code" || reason === "invalid_request") {
          setDeleteError(tDelete("invalid"));
        } else {
          setDeleteError(tDelete("error"));
        }
        setDeleteLoading(false);
        return;
      }
      setDeleteStep("done");
      setDeleteStatus(tDelete("completed"));
      setTimeout(() => {
        clearAccessToken();
        router.replace(PAGE_ROUTES.HOME);
      }, 3000);
    } catch {
      setDeleteError(tDelete("error"));
      setDeleteLoading(false);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteStep("idle");
    setDeleteCode("");
    setDeleteChallengeToken(null);
    setDeleteStatus(null);
    setDeleteError(null);
    setDeleteIntent(false);
  };

  const handleDeleteProceed = () => {
    setDeleteError(null);
    setDeleteStatus(null);
    setDeleteStep("confirm");
  };

  const handleRemoveBoost = async (shortId: string) => {
    if (!accessToken) return;
    const prev = boosts;
    setBoosts((current) => current.filter((item) => item.shortId !== shortId));
    try {
      const response = await fetch(API_ROUTES.VIDEO.BOOSTS(shortId), {
        method: "DELETE",
        headers: createAuthHeaders(accessToken),
      });
      if (!response.ok) {
        setBoosts(prev);
      }
    } catch {
      setBoosts(prev);
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl dark:text-white">
          {t("title")}
        </h1>
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

      {error && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
          {t("error")}
        </div>
      )}

      {loading ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <ProfileSkeleton />
          <GuildSkeleton />
        </div>
      ) : profile ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <ProfileCard profile={profile} />
          <GuildCard />
        </div>
      ) : null}

      {profile && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
            {t("preferences.title")}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <PreferenceBlock
              enabled={profile.allowCommunityEmails}
              disabled={updatingPreference}
              onToggle={handleCommunityEmailsToggle}
            />
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {t("activity.title")}
        </h2>
        <div className="grid gap-6 lg:grid-cols-2">
          <BoostedVideosBlock
            loading={boostsLoading}
            error={boostsError}
            items={boosts}
            onRemove={handleRemoveBoost}
          />
          <LoginAttemptsBlock items={attempts} loading={attemptsLoading} error={attemptsError} />
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
          {t("support.title")}
        </h2>
        <div className="grid gap-3 sm:grid-cols-2">
          <a
            href={PAGE_ROUTES.CONTACT_WITH_TYPE("feature")}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/70 p-4 transition hover:border-brand-200 hover:bg-brand-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-brand-500/30 dark:hover:bg-brand-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-600 transition group-hover:bg-brand-200 dark:bg-brand-500/20 dark:text-brand-300 dark:group-hover:bg-brand-500/30">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polygon points="14 2 18 6 7 17 3 17 3 13 14 2" />
                <line x1="3" y1="22" x2="21" y2="22" />
              </svg>
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {t("support.featureRequest")}
            </span>
          </a>
          <a
            href={PAGE_ROUTES.CONTACT_WITH_TYPE("support")}
            className="group flex items-center gap-4 rounded-2xl border border-neutral-200/70 bg-white/70 p-4 transition hover:border-amber-200 hover:bg-amber-50/50 dark:border-white/10 dark:bg-white/5 dark:hover:border-amber-500/30 dark:hover:bg-amber-500/5"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600 transition group-hover:bg-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:group-hover:bg-amber-500/30">
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
            </div>
            <span className="text-sm font-medium text-neutral-700 dark:text-neutral-200">
              {t("support.technicalIssue")}
            </span>
          </a>
        </div>
      </div>

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
