"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

import { PlusIcon, XIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";

import type { AudienceCounts, NewsletterWizardData } from "./types";

interface AudienceStepProps {
  data: NewsletterWizardData["audience"];
  onUpdate: (audience: NewsletterWizardData["audience"]) => void;
  counts: AudienceCounts | null;
}

export function AudienceStep({ data, onUpdate, counts }: AudienceStepProps) {
  const t = useTranslations("newsletterEditor");
  const [newEmail, setNewEmail] = useState("");

  const handleTypeChange = (value: string) => {
    onUpdate({
      ...data,
      type: value as NewsletterWizardData["audience"]["type"],
    });
  };

  const handleAddEmail = () => {
    const email = newEmail.trim().toLowerCase();
    if (email && !data.manualEmails.includes(email)) {
      onUpdate({
        ...data,
        manualEmails: [...data.manualEmails, email],
      });
      setNewEmail("");
    }
  };

  const handleRemoveEmail = (email: string) => {
    onUpdate({
      ...data,
      manualEmails: data.manualEmails.filter((e) => e !== email),
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddEmail();
    }
  };

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t("audienceTitle")}</h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("audienceHint")}</p>
      </div>

      <div className="space-y-4">
        {(
          [
            {
              value: "all",
              label: t("audienceAll"),
              desc: t("audienceAllDesc"),
              count: counts?.all,
            },
            {
              value: "subscribers",
              label: t("audienceSubscribers"),
              desc: t("audienceSubscribersDesc"),
              count: counts?.subscribers,
            },
            {
              value: "registered",
              label: t("audienceRegistered"),
              desc: t("audienceRegisteredDesc"),
              count: counts?.registered,
            },
            {
              value: "manual",
              label: t("audienceManual"),
              desc: t("audienceManualDesc"),
              count: data.manualEmails.length || undefined,
            },
          ] as const
        ).map((option) => (
          <label
            key={option.value}
            className={`flex cursor-pointer items-start gap-3 rounded-lg border p-4 transition-colors ${
              data.type === option.value
                ? "border-rose-500 bg-rose-50 dark:border-rose-400 dark:bg-rose-500/10"
                : "border-neutral-200/80 bg-white/60 dark:border-white/10 dark:bg-white/5"
            }`}
          >
            <input
              type="radio"
              name="audience"
              value={option.value}
              checked={data.type === option.value}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleTypeChange(e.target.value)
              }
              className="mt-1 h-4 w-4 cursor-pointer text-rose-600 accent-rose-600"
            />
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-neutral-900 dark:text-white">
                  {option.label}
                </span>
                {option.value !== "manual" && counts === null ? (
                  <span className="h-4 w-8 animate-pulse rounded-full bg-neutral-200 dark:bg-white/10" />
                ) : option.count !== undefined ? (
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold tabular-nums ${
                      data.type === option.value
                        ? "bg-rose-200 text-rose-800 dark:bg-rose-500/30 dark:text-rose-200"
                        : "bg-neutral-200 text-neutral-600 dark:bg-white/10 dark:text-neutral-400"
                    }`}
                  >
                    {option.count.toLocaleString()}
                  </span>
                ) : null}
              </div>
              <p className="text-sm text-neutral-500 dark:text-neutral-400">{option.desc}</p>
            </div>
          </label>
        ))}
      </div>

      <div className="space-y-4">
        <h3 className="font-semibold text-neutral-900 dark:text-white">{t("manualEmailsTitle")}</h3>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("manualEmailsHint")}</p>

        <div className="flex gap-2">
          <input
            type="email"
            value={newEmail}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setNewEmail(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("emailPlaceholder")}
            className="form-input-base form-input flex-1"
          />
          <Button onClick={handleAddEmail} variant="secondary" size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("addEmail")}
          </Button>
        </div>

        {data.manualEmails.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {data.manualEmails.map((email) => (
              <div
                key={email}
                className="flex items-center gap-1 rounded-full bg-rose-100 px-3 py-1 text-sm text-rose-800 dark:bg-rose-500/20 dark:text-rose-200"
              >
                <span>{email}</span>
                <button
                  onClick={() => handleRemoveEmail(email)}
                  className="ml-1 rounded-full p-0.5 hover:bg-rose-200 dark:hover:bg-rose-500/30"
                  type="button"
                >
                  <XIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
