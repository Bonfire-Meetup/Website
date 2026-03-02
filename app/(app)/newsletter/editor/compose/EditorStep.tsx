"use client";

import { useTranslations } from "next-intl";

import { RichTextArea } from "@/components/newsletter/RichTextArea";
import { ChevronDownIcon, PlusIcon, TrashIcon } from "@/components/shared/Icons";
import { Button } from "@/components/ui/Button";

import type { NewsletterSection, NewsletterWizardData } from "./types";

interface EditorStepProps {
  data: NewsletterWizardData;
  onUpdatePrimaryNews: (updates: Partial<NewsletterSection>) => void;
  onAddSecondaryNews: () => void;
  onUpdateSecondaryNews: (id: string, updates: Partial<NewsletterSection>) => void;
  onRemoveSecondaryNews: (id: string) => void;
  onMoveSecondaryNews: (id: string, direction: "up" | "down") => void;
  onUpdateSubject: (subject: string) => void;
  onUpdatePreviewText: (previewText: string) => void;
}

const INPUT_CLASS = "form-input-base form-input";

export function EditorStep({
  data,
  onUpdatePrimaryNews,
  onAddSecondaryNews,
  onUpdateSecondaryNews,
  onRemoveSecondaryNews,
  onMoveSecondaryNews,
  onUpdateSubject,
  onUpdatePreviewText,
}: EditorStepProps) {
  const t = useTranslations("newsletterEditor");

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{t("subjectLabel")}</h2>
        <div className="space-y-2">
          <label htmlFor="subject" className="form-label">
            {t("subject")} *
          </label>
          <input
            id="subject"
            type="text"
            value={data.subject}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onUpdateSubject(e.target.value)}
            placeholder={t("subjectPlaceholder")}
            className={INPUT_CLASS}
          />
        </div>
        <div className="space-y-2">
          <label htmlFor="previewText" className="form-label">
            {t("previewText")}
          </label>
          <input
            id="previewText"
            type="text"
            value={data.previewText}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              onUpdatePreviewText(e.target.value)
            }
            placeholder={t("previewTextPlaceholder")}
            className={INPUT_CLASS}
          />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("previewTextHint")}</p>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
          {t("primaryNewsTitle")}
        </h2>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("primaryNewsHint")}</p>

        <div className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5">
          <div className="space-y-2">
            <label htmlFor="primary-title" className="form-label">
              {t("newsTitle")} *
            </label>
            <input
              id="primary-title"
              type="text"
              value={data.primaryNews.title}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdatePrimaryNews({ title: e.target.value })
              }
              placeholder={t("titlePlaceholder")}
              className={INPUT_CLASS}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="primary-text" className="form-label">
              {t("newsText")} *
            </label>
            <RichTextArea
              id="primary-text"
              value={data.primaryNews.text}
              onChange={(text) => onUpdatePrimaryNews({ text })}
              placeholder={t("textPlaceholder")}
              rows={14}
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="primary-image" className="form-label">
              {t("imageUrl")}
            </label>
            <input
              id="primary-image"
              type="text"
              value={data.primaryNews.imageUrl || ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                onUpdatePrimaryNews({ imageUrl: e.target.value })
              }
              placeholder={t("imageUrlPlaceholder")}
              className={INPUT_CLASS}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="primary-cta-label" className="form-label">
                {t("ctaLabel")}
              </label>
              <input
                id="primary-cta-label"
                type="text"
                value={data.primaryNews.ctaLabel || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdatePrimaryNews({ ctaLabel: e.target.value })
                }
                placeholder={t("ctaLabelPlaceholder")}
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="primary-cta-href" className="form-label">
                {t("ctaLink")}
              </label>
              <input
                id="primary-cta-href"
                type="text"
                value={data.primaryNews.ctaHref || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdatePrimaryNews({ ctaHref: e.target.value })
                }
                placeholder={t("ctaLinkPlaceholder")}
                className={INPUT_CLASS}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-neutral-900 dark:text-white">
            {t("secondaryNewsTitle")}
          </h2>
          <Button onClick={onAddSecondaryNews} variant="secondary" size="sm" className="gap-2">
            <PlusIcon className="h-4 w-4" />
            {t("addNews")}
          </Button>
        </div>
        <p className="text-sm text-neutral-500 dark:text-neutral-400">{t("secondaryNewsHint")}</p>

        {data.secondaryNews.length === 0 && (
          <p className="text-sm text-neutral-400 italic dark:text-neutral-500">
            {t("noSecondaryNews")}
          </p>
        )}

        {data.secondaryNews.map((section, index) => (
          <div
            key={section.id}
            className="space-y-4 rounded-xl border border-neutral-200/80 bg-white/60 p-4 dark:border-white/10 dark:bg-white/5"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-neutral-900 dark:text-white">
                {t("newsNumber", { number: index + 1 })}
              </h3>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => onMoveSecondaryNews(section.id, "up")}
                  disabled={index === 0}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  aria-label="Move up"
                >
                  <ChevronDownIcon className="h-4 w-4 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={() => onMoveSecondaryNews(section.id, "down")}
                  disabled={index === data.secondaryNews.length - 1}
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-neutral-700 disabled:cursor-not-allowed disabled:opacity-30 dark:text-neutral-500 dark:hover:bg-white/10 dark:hover:text-neutral-200"
                  aria-label="Move down"
                >
                  <ChevronDownIcon className="h-4 w-4" />
                </button>
                <button
                  onClick={() => onRemoveSecondaryNews(section.id)}
                  type="button"
                  className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-rose-500 transition hover:bg-rose-100/60 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-500/10 dark:hover:text-rose-300"
                  aria-label={t("removeNews")}
                >
                  <TrashIcon className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor={`${section.id}-title`} className="form-label">
                {t("newsTitle")} *
              </label>
              <input
                id={`${section.id}-title`}
                type="text"
                value={section.title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateSecondaryNews(section.id, { title: e.target.value })
                }
                placeholder={t("titlePlaceholder")}
                className={INPUT_CLASS}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`${section.id}-text`} className="form-label">
                {t("newsText")} *
              </label>
              <RichTextArea
                id={`${section.id}-text`}
                value={section.text}
                onChange={(text) => onUpdateSecondaryNews(section.id, { text })}
                placeholder={t("textPlaceholder")}
                rows={12}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor={`${section.id}-image`} className="form-label">
                {t("imageUrl")}
              </label>
              <input
                id={`${section.id}-image`}
                type="text"
                value={section.imageUrl || ""}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  onUpdateSecondaryNews(section.id, { imageUrl: e.target.value })
                }
                placeholder={t("imageUrlPlaceholder")}
                className={INPUT_CLASS}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label htmlFor={`${section.id}-cta-label`} className="form-label">
                  {t("ctaLabel")}
                </label>
                <input
                  id={`${section.id}-cta-label`}
                  type="text"
                  value={section.ctaLabel || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onUpdateSecondaryNews(section.id, { ctaLabel: e.target.value })
                  }
                  placeholder={t("ctaLabelPlaceholder")}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor={`${section.id}-cta-href`} className="form-label">
                  {t("ctaLink")}
                </label>
                <input
                  id={`${section.id}-cta-href`}
                  type="text"
                  value={section.ctaHref || ""}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    onUpdateSecondaryNews(section.id, { ctaHref: e.target.value })
                  }
                  placeholder={t("ctaLinkPlaceholder")}
                  className={INPUT_CLASS}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
