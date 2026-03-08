"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";

import { UserAvatar } from "@/components/user/UserAvatar";
import { ApiError } from "@/lib/api/errors";
import { useUpdatePreferenceMutation, type Profile } from "@/lib/api/user-profile";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { hashToU64, makeAvatarSeedFromId } from "@/lib/utils/hash-rng";
import { formatDate } from "@/lib/utils/locale";

import { AccountPanel } from "./AccountPanel";

interface ProfileCardProps {
  profile: Profile;
  onProfileUpdate?: (updatedProfile: Profile) => void;
}

export function ProfileCard({ profile, onProfileUpdate }: ProfileCardProps) {
  const t = useTranslations("account");
  const locale = useLocale();

  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [isEditingName, setIsEditingName] = useState(false);
  const [prevProfileName, setPrevProfileName] = useState(profile.name);
  const [nameValue, setNameValue] = useState(profile.name || "");
  const [nameErrorKey, setNameErrorKey] = useState<string | null>(null);

  if (prevProfileName !== profile.name) {
    setPrevProfileName(profile.name);
    setNameValue(profile.name || "");
  }

  const updatePreferenceMutation = useUpdatePreferenceMutation();
  const updatingName = updatePreferenceMutation.isPending;

  const copyTimeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current);
      }
    },
    [],
  );

  const handleCopyId = async () => {
    const success = await copyToClipboard(profile.id);
    setCopyStatus(success ? "success" : "error");

    copyTimeoutRef.current = window.setTimeout(() => {
      setCopyStatus("idle");
    }, 2000);
  };

  const handleNameSave = async () => {
    const trimmedName = nameValue.trim() || null;

    if (trimmedName && trimmedName.length > 50) {
      setNameErrorKey("name.tooLong");
      return;
    }

    if (trimmedName === profile.name) {
      setIsEditingName(false);
      return;
    }

    setNameErrorKey(null);

    try {
      await updatePreferenceMutation.mutateAsync({ name: trimmedName });
      setIsEditingName(false);
      if (onProfileUpdate) {
        onProfileUpdate({ ...profile, name: trimmedName });
      }
    } catch (err: unknown) {
      let reason: string | null = null;

      if (err instanceof ApiError && err.data && typeof err.data === "object") {
        const data = err.data as { error?: unknown };
        if (typeof data.error === "string") {
          reason = data.error;
        }
      }

      if (reason === "profanity_detected") {
        setNameErrorKey("name.profanityError");
      } else if (reason === "name_too_long") {
        setNameErrorKey("name.tooLong");
      } else {
        setNameErrorKey("name.updateError");
      }

      setNameValue(profile.name || "");
    }
  };

  const handleNameCancel = () => {
    setNameValue(profile.name || "");
    setNameErrorKey(null);
    setIsEditingName(false);
  };

  const fieldLabelClassName =
    "text-[10px] font-medium tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500";

  return (
    <AccountPanel
      title={
        <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
          {t("details")}
        </span>
      }
      action={
        <UserAvatar
          avatarSeed={makeAvatarSeedFromId(hashToU64(profile.id))}
          className="ring-1 ring-black/5 dark:ring-white/10"
          isTiny
          name={profile.name ?? profile.email}
          size={32}
        />
      }
    >
      <div className="space-y-5">
        <div>
          <div className={fieldLabelClassName}>{t("name.label")}</div>

          {isEditingName ? (
            <div className="mt-2 space-y-2">
              <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-start">
                <input
                  type="text"
                  value={nameValue}
                  maxLength={50}
                  disabled={updatingName}
                  onChange={(e) => {
                    setNameValue(e.target.value);
                    setNameErrorKey(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNameSave();
                    }
                    if (e.key === "Escape") {
                      handleNameCancel();
                    }
                  }}
                  placeholder={t("name.placeholder")}
                  className="focus:border-brand-500 focus:ring-brand-500/20 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 transition focus:ring-2 focus:outline-none dark:border-white/10 dark:bg-white/5 dark:text-white"
                />

                <div className="flex gap-2 sm:shrink-0">
                  <button
                    type="button"
                    onClick={handleNameSave}
                    disabled={updatingName || nameValue.trim() === (profile.name || "")}
                    className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 h-[38px] flex-1 rounded-lg px-3 text-xs font-medium text-white transition disabled:opacity-50 sm:flex-none"
                  >
                    {t("name.save")}
                  </button>
                  <button
                    type="button"
                    onClick={handleNameCancel}
                    disabled={updatingName}
                    className="h-[38px] flex-1 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 disabled:opacity-50 sm:flex-none dark:border-white/10 dark:bg-white/5 dark:text-neutral-300"
                  >
                    {t("name.cancel")}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-400 dark:text-neutral-500">
                <span>{nameValue.length}/50</span>
                {nameValue.length > 45 && (
                  <span className="text-amber-600 dark:text-amber-400">
                    {t("name.characterLimit")}
                  </span>
                )}
              </div>

              {nameErrorKey && (
                <div className="text-xs text-rose-600 dark:text-rose-400">{t(nameErrorKey)}</div>
              )}
            </div>
          ) : (
            <div className="mt-2 flex items-center gap-2">
              <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                {profile.name || t("name.empty")}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                title={t("name.edit")}
                className="rounded-lg border border-neutral-200/80 bg-white/85 px-2 py-1 text-xs font-medium text-neutral-500 transition hover:-translate-y-px hover:border-neutral-300 hover:text-neutral-800 dark:border-white/10 dark:bg-white/6 dark:text-neutral-400 dark:hover:border-white/15 dark:hover:text-white"
              >
                {t("name.edit")}
              </button>
            </div>
          )}
        </div>

        <div>
          <div className={fieldLabelClassName}>{t("email")}</div>
          <div className="mt-2 text-sm font-medium text-neutral-900 dark:text-neutral-100">
            {profile.email}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className={fieldLabelClassName}>{t("created")}</div>
            <div className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {formatDate(profile.createdAt, locale)}
            </div>
          </div>
          <div>
            <div className={fieldLabelClassName}>{t("lastLogin")}</div>
            <div className="mt-2 text-sm font-medium text-neutral-700 dark:text-neutral-300">
              {profile.lastLoginAt ? formatDate(profile.lastLoginAt, locale) : t("empty")}
            </div>
          </div>
        </div>

        <div className="border-t border-neutral-200/70 pt-4 dark:border-white/8">
          <div className={fieldLabelClassName}>{t("userId")}</div>
          <div className="mt-2 flex flex-col items-start gap-2 sm:flex-row sm:items-center">
            <code className="max-w-full font-mono text-xs break-all text-neutral-500 dark:text-neutral-400">
              {profile.id}
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              title={
                copyStatus === "success"
                  ? t("copySuccess")
                  : copyStatus === "error"
                    ? t("copyError")
                    : t("copyIdLabel")
              }
              className="rounded-lg border border-neutral-200/80 bg-white/85 px-2 py-1 text-xs font-medium text-neutral-500 transition hover:-translate-y-px hover:border-neutral-300 hover:text-neutral-800 dark:border-white/10 dark:bg-white/6 dark:text-neutral-400 dark:hover:border-white/15 dark:hover:text-white"
            >
              {copyStatus === "success" ? t("copySuccess") : t("copyIdLabel")}
            </button>
          </div>
        </div>
      </div>
    </AccountPanel>
  );
}
