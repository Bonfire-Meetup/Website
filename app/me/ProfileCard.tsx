"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { API_ROUTES } from "@/lib/api/routes";
import { readAccessToken } from "@/lib/auth/client";
import { copyToClipboard } from "@/lib/utils/clipboard";
import { createJsonAuthHeaders } from "@/lib/utils/http";
import { formatDate } from "@/lib/utils/locale";

interface Profile {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  allowCommunityEmails: boolean;
  publicProfile: boolean;
  name: string | null;
}

interface ProfileCardProps {
  profile: Profile;
  onProfileUpdate?: (updatedProfile: Profile) => void;
}

export function ProfileCard({ profile, onProfileUpdate }: ProfileCardProps) {
  const t = useTranslations("account");
  const locale = useLocale();
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");
  const [isEditingName, setIsEditingName] = useState(false);
  const [nameValue, setNameValue] = useState(profile.name || "");
  const [nameErrorKey, setNameErrorKey] = useState<string | null>(null);
  const [updatingName, setUpdatingName] = useState(false);

  const handleCopyId = async () => {
    const success = await copyToClipboard(profile.id);
    setCopyStatus(success ? "success" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  const handleNameSave = async () => {
    const token = readAccessToken();
    if (!token) {
      return;
    }

    const trimmedName = nameValue.trim() || null;

    if (trimmedName && trimmedName.length > 50) {
      setNameErrorKey("name.tooLong");
      return;
    }

    setUpdatingName(true);
    setNameErrorKey(null);

    try {
      const response = await fetch(API_ROUTES.ME.PREFERENCES, {
        body: JSON.stringify({ name: trimmedName }),
        headers: createJsonAuthHeaders(token),
        method: "PATCH",
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        if (data?.error === "profanity_detected") {
          setNameErrorKey("name.profanityError");
        } else if (data?.error === "name_too_long") {
          setNameErrorKey("name.tooLong");
        } else {
          setNameErrorKey("name.updateError");
        }
        setNameValue(profile.name || "");
        return;
      }

      const updatedProfile = { ...profile, name: trimmedName };
      onProfileUpdate?.(updatedProfile);
      setIsEditingName(false);
    } catch {
      setNameErrorKey("name.updateError");
      setNameValue(profile.name || "");
    } finally {
      setUpdatingName(false);
    }
  };

  const handleNameCancel = () => {
    setNameValue(profile.name || "");
    setNameErrorKey(null);
    setIsEditingName(false);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-white/5">
        <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
          {t("details")}
        </span>
        <div className="bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
          {profile.email.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
            {t("name.label")}
          </div>
          {isEditingName ? (
            <div className="mt-1 space-y-2">
              <div className="flex items-start gap-2">
                <input
                  type="text"
                  value={nameValue}
                  onChange={(e) => {
                    if (e.target.value.length <= 50) {
                      setNameValue(e.target.value);
                      setNameErrorKey(null);
                    }
                  }}
                  maxLength={50}
                  disabled={updatingName}
                  className="focus:border-brand-500 focus:ring-brand-500/20 dark:focus:border-brand-400 flex-1 rounded-lg border border-neutral-200 bg-white px-3 py-2.5 text-sm text-neutral-900 placeholder-neutral-400 transition focus:ring-2 focus:outline-none sm:px-4 sm:py-3 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder-neutral-500"
                  placeholder={t("name.placeholder")}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleNameSave();
                    }
                    if (e.key === "Escape") {
                      handleNameCancel();
                    }
                  }}
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleNameSave}
                    disabled={updatingName}
                    className="bg-brand-500 hover:bg-brand-600 active:bg-brand-700 dark:bg-brand-600 dark:hover:bg-brand-500 dark:active:bg-brand-700 h-[38px] shrink-0 rounded-lg px-3 text-xs font-medium text-white transition disabled:opacity-50 sm:h-[44px] sm:px-3 sm:text-sm"
                  >
                    {t("name.save")}
                  </button>
                  <button
                    type="button"
                    onClick={handleNameCancel}
                    disabled={updatingName}
                    className="h-[38px] shrink-0 rounded-lg border border-neutral-200 bg-white px-3 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50 active:bg-neutral-100 disabled:opacity-50 sm:h-[44px] sm:px-3 sm:text-sm dark:border-white/10 dark:bg-white/5 dark:text-neutral-300 dark:hover:bg-white/10 dark:active:bg-white/20"
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
            <div className="mt-1 flex items-center gap-2">
              <div className="font-medium text-neutral-900 dark:text-neutral-100">
                {profile.name || t("name.empty")}
              </div>
              <button
                type="button"
                onClick={() => setIsEditingName(true)}
                className="rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/5 dark:hover:text-neutral-300"
                title={t("name.edit")}
              >
                <svg
                  className="h-3.5 w-3.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
        <div>
          <div className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
            {t("email")}
          </div>
          <div className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
            {profile.email}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
              {t("created")}
            </div>
            <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {formatDate(profile.createdAt, locale)}
            </div>
          </div>
          <div>
            <div className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
              {t("lastLogin")}
            </div>
            <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {profile.lastLoginAt ? formatDate(profile.lastLoginAt, locale) : t("empty")}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-100 pt-4 dark:border-white/5">
          <div className="text-[10px] tracking-[0.2em] text-neutral-400 uppercase dark:text-neutral-500">
            {t("userId")}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <code className="font-mono text-xs text-neutral-500 dark:text-neutral-400">
              {profile.id}
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              className="cursor-pointer rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/5 dark:hover:text-neutral-300"
              title={
                copyStatus === "success"
                  ? t("copySuccess")
                  : copyStatus === "error"
                    ? t("copyError")
                    : t("copyIdLabel")
              }
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
