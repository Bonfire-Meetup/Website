import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { getNewsletterArchiveBySlug } from "@/lib/data/newsletter-archive";

import { type NewsletterArchiveData, NewsletterArchiveContent } from "./NewsletterArchiveContent";

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

function serializeNewsletter(
  subject: string,
  previewText: string | null,
  testSend: boolean,
  sentAt: Date,
  sections: Section[],
): NewsletterArchiveData {
  return {
    subject,
    previewText,
    testSend,
    sentAt: sentAt.toISOString(),
    sections,
  };
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

  const newsletterData = serializeNewsletter(
    newsletter.subject,
    newsletter.previewText,
    newsletter.testSend,
    newsletter.sentAt,
    sections,
  );

  return <NewsletterArchiveContent newsletter={newsletterData} />;
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
