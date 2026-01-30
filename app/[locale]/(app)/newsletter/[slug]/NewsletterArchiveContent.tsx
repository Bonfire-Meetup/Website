"use client";

import { useTranslations } from "next-intl";

import { AccentBar } from "@/components/ui/AccentBar";
import { Button } from "@/components/ui/Button";

export interface NewsletterSection {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

export interface NewsletterArchiveData {
  subject: string;
  previewText: string | null;
  testSend: boolean;
  sentAt: string;
  sections: NewsletterSection[];
}

interface NewsletterArchiveContentProps {
  newsletter: NewsletterArchiveData;
}

export function NewsletterArchiveContent({ newsletter }: NewsletterArchiveContentProps) {
  const t = useTranslations("sections.newsletterArchive");
  const sentDate = new Date(newsletter.sentAt);

  return (
    <main className="gradient-bg-static relative min-h-screen overflow-hidden px-4 pt-32 pb-24">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
        <div className="absolute top-1/2 left-1/4 h-72 w-72 rounded-full bg-[radial-gradient(circle_at_center,var(--color-fire-glow-light-mid),transparent_62%)] opacity-30 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {newsletter.testSend && (
          <div className="mb-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center dark:border-amber-600 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-800 dark:text-amber-200">
              {t("testBannerTitle")}
            </p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              {t("testBannerMessage")}
            </p>
          </div>
        )}

        <div className="mb-12 text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-6 flex items-center justify-center gap-2 text-xs font-bold tracking-[0.4em] uppercase sm:gap-3 sm:text-sm sm:tracking-[0.5em]">
            <span className="to-brand-400 h-px w-8 bg-gradient-to-r from-transparent sm:w-12" />
            {t("eyebrow")}
            <span className="to-brand-400 h-px w-8 bg-gradient-to-l from-transparent sm:w-12" />
          </p>
          <div className="mb-4 flex items-center justify-center gap-4">
            <AccentBar />
            <h1 className="text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
              {newsletter.subject}
            </h1>
          </div>
          {newsletter.previewText && (
            <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
              {newsletter.previewText}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {newsletter.sections.map((section, index) => (
            <article
              key={section.id}
              className="glass-card no-hover-pop overflow-hidden rounded-[24px]"
            >
              <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-fuchsia-700 via-orange-500 to-red-600" />

              {section.imageUrl && (
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-8 sm:p-10">
                {!section.imageUrl && index > 0 && (
                  <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-neutral-400 uppercase dark:text-neutral-500">
                    {t("updateLabel", { number: String(index).padStart(2, "0") })}
                  </p>
                )}

                <h2 className="mb-4 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                  {section.title}
                </h2>

                <div className="prose prose-neutral dark:prose-invert max-w-none">
                  <p className="leading-relaxed whitespace-pre-wrap text-neutral-600 dark:text-neutral-300">
                    {section.text}
                  </p>
                </div>

                {section.ctaHref && section.ctaLabel && (
                  <div className="mt-6">
                    <Button href={section.ctaHref} variant="primary" size="md">
                      {section.ctaLabel}
                    </Button>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            {t("sentOn", { sentDate })}
          </p>
        </div>
      </div>
    </main>
  );
}
