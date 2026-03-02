"use client";

import { Button } from "@/components/ui/Button";
import type { NewsletterSection } from "@/lib/types/newsletter";
import { renderMarkdownToHtml } from "@/lib/utils/newsletter-markdown";

interface NewsletterSectionCardProps {
  section: NewsletterSection;
  secondaryLabel?: string;
  variant: "preview" | "display";
}

const GRADIENT = "bg-gradient-to-r from-rose-700 via-orange-500 to-red-600";

export function NewsletterSectionCard({
  section,
  secondaryLabel,
  variant,
}: NewsletterSectionCardProps) {
  if (variant === "preview") {
    return (
      <div className="bg-white dark:bg-neutral-900">
        <div className={`h-1 w-full shrink-0 ${GRADIENT}`} />

        {section.imageUrl && (
          <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800">
            <img
              src={section.imageUrl}
              alt=""
              className="h-full w-full object-cover object-center"
            />
          </div>
        )}

        <div className="px-5 py-4">
          {!section.imageUrl && secondaryLabel && (
            <p className="mb-2 text-[10px] font-bold tracking-wider text-neutral-400 uppercase dark:text-neutral-500">
              {secondaryLabel}
            </p>
          )}
          <h3 className="font-semibold text-neutral-900 dark:text-white">{section.title}</h3>
          <div
            className="mt-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400 [&_a]:text-orange-500 [&_a]:underline"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: renderMarkdownToHtml(section.text) }}
          />
          {section.ctaLabel && section.ctaHref && (
            <p className="mt-3">
              <span
                className={`inline-flex rounded-lg ${GRADIENT} px-4 py-2 text-xs font-semibold text-white shadow-sm`}
              >
                {section.ctaLabel}
              </span>
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <article className="glass-card no-hover-pop overflow-hidden rounded-[24px]">
      <div className={`h-1.5 w-full shrink-0 ${GRADIENT}`} />

      {section.imageUrl && (
        <div className="relative h-64 w-full overflow-hidden">
          <img src={section.imageUrl} alt={section.title} className="h-full w-full object-cover" />
        </div>
      )}

      <div className="p-8 sm:p-10">
        {!section.imageUrl && secondaryLabel && (
          <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-neutral-400 uppercase dark:text-neutral-500">
            {secondaryLabel}
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
  );
}
