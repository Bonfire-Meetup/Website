"use client";

import { formatDate } from "@/app/lib/utils/locale";
import { copyToClipboard } from "@/app/lib/utils/clipboard";
import { useState } from "react";

type Profile = {
  id: string;
  email: string;
  createdAt: string;
  lastLoginAt: string | null;
  allowCommunityEmails: boolean;
};

type ProfileCardLabels = {
  email: string;
  userId: string;
  created: string;
  lastLogin: string;
  empty: string;
  copySuccess: string;
  copyError: string;
  copyIdLabel: string;
};

type ProfileCardProps = {
  profile: Profile;
  locale: string;
  labels: ProfileCardLabels;
};

export function ProfileCard({ profile, locale, labels }: ProfileCardProps) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "success" | "error">("idle");

  const handleCopyId = async () => {
    const success = await copyToClipboard(profile.id);
    setCopyStatus(success ? "success" : "error");
    setTimeout(() => setCopyStatus("idle"), 2000);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200/70 bg-white/70 dark:border-white/10 dark:bg-white/5">
      <div className="flex items-center justify-between border-b border-neutral-100 px-5 py-3 dark:border-white/5">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-neutral-500 dark:text-neutral-400">
          {labels.email}
        </span>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-600 dark:bg-brand-500/20 dark:text-brand-300">
          {profile.email.charAt(0).toUpperCase()}
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            {labels.email}
          </div>
          <div className="mt-1 font-medium text-neutral-900 dark:text-neutral-100">
            {profile.email}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              {labels.created}
            </div>
            <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {formatDate(profile.createdAt, locale)}
            </div>
          </div>
          <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
              {labels.lastLogin}
            </div>
            <div className="mt-1 text-sm text-neutral-700 dark:text-neutral-300">
              {profile.lastLoginAt ? formatDate(profile.lastLoginAt, locale) : labels.empty}
            </div>
          </div>
        </div>
        <div className="border-t border-neutral-100 pt-4 dark:border-white/5">
          <div className="text-[10px] uppercase tracking-[0.2em] text-neutral-400 dark:text-neutral-500">
            {labels.userId}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <code className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
              {profile.id}
            </code>
            <button
              type="button"
              onClick={handleCopyId}
              className="cursor-pointer rounded p-1 text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-600 dark:hover:bg-white/5 dark:hover:text-neutral-300"
              title={
                copyStatus === "success"
                  ? labels.copySuccess
                  : copyStatus === "error"
                    ? labels.copyError
                    : labels.copyIdLabel
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
