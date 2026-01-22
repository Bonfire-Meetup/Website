"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";

import { copyToClipboard } from "@/lib/utils/clipboard";
import { formatDate } from "@/lib/utils/locale";

interface Profile {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  allowCommunityEmails: boolean;
}

interface ProfileCardProps {
  profile: Profile;
}

export function ProfileCard({ profile }: ProfileCardProps) {
  const t = useTranslations("account");
  const locale = useLocale();
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCopyId = async () => {
    const success = await copyToClipboard(profile.id);
    setCopyStatus(success ? "success" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-white/5">
        <span className="text-xs font-semibold tracking-[0.2em] text-neutral-500 uppercase dark:text-neutral-400">
          {t("email")}
        </span>
        <div className="bg-brand-100 text-brand-600 dark:bg-brand-500/20 dark:text-brand-300 flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold">
          {profile.email.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="space-y-4 p-5">
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
