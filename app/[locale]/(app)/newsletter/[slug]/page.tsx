import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getNewsletterArchiveBySlug } from "@/lib/data/newsletter-archive";

interface Section {
  id: string;
  title: string;
  text: string;
  imageUrl?: string;
  ctaLabel?: string;
  ctaHref?: string;
}

interface NewsletterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterArchiveBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  const data = newsletter.data as { sections?: unknown[] } | undefined;
  const rawSections = Array.isArray(data?.sections) ? data.sections : [];
  const sections = rawSections.filter(
    (s): s is Section =>
      typeof s === "object" && s !== null && "id" in s && "title" in s && "text" in s,
  );

  return (
    <main className="relative min-h-screen overflow-hidden bg-neutral-50 px-4 pt-32 pb-24 dark:bg-neutral-950">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 left-1/2 h-[560px] w-[560px] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,var(--color-brand-glow-9),transparent_62%)]" />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl">
        {newsletter.testSend && (
          <div className="mb-8 rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 text-center dark:border-amber-600 dark:bg-amber-950/30">
            <p className="font-semibold text-amber-800 dark:text-amber-200">Test Email</p>
            <p className="mt-1 text-sm text-amber-700 dark:text-amber-300">
              This newsletter was sent as a test
            </p>
          </div>
        )}

        <div className="mb-12 text-center">
          <p className="text-brand-600 dark:text-brand-300 mb-4 text-xs font-bold tracking-[0.4em] uppercase">
            Newsletter
          </p>
          <h1 className="mb-4 text-3xl font-black tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white">
            {newsletter.subject}
          </h1>
          {newsletter.previewText && (
            <p className="mx-auto max-w-xl text-neutral-600 dark:text-neutral-400">
              {newsletter.previewText}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {sections.map((section, index) => (
            <article
              key={section.id}
              className="group overflow-hidden rounded-3xl border border-neutral-200/70 bg-white/80 backdrop-blur-sm transition-all dark:border-white/5 dark:bg-white/5"
            >
              <div className="h-1.5 bg-gradient-to-r from-violet-500 via-rose-500 to-amber-500" />

              {section.imageUrl && (
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={section.imageUrl}
                    alt={section.title}
                    className="h-full w-full object-cover"
                  />
                </div>
              )}

              <div className="p-8">
                {!section.imageUrl && index > 0 && (
                  <p className="mb-3 text-[11px] font-bold tracking-[0.15em] text-neutral-400 uppercase dark:text-neutral-500">
                    Update {String(index).padStart(2, "0")}
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
                    <a
                      href={section.ctaHref}
                      className="inline-flex items-center rounded-xl bg-gradient-to-r from-violet-600 to-rose-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-violet-500/25 transition-all hover:shadow-xl hover:shadow-violet-500/30"
                    >
                      {section.ctaLabel}
                    </a>
                  </div>
                )}
              </div>
            </article>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-sm text-neutral-500 dark:text-neutral-500">
            Sent{" "}
            {newsletter.sentAt.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const newsletter = await getNewsletterArchiveBySlug(slug);
  const t = await getTranslations("common");
  const brandName = t("brandName");

  if (!newsletter) {
    return {
      title: `Newsletter Not Found | ${brandName}`,
    };
  }

  return {
    title: `${newsletter.subject} | ${brandName}`,
    description: newsletter.previewText ?? undefined,
  };
}
