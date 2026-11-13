import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getNewsletterArchiveBySlug, toNewsletterDetail } from "@/lib/data/newsletter-archive";
import { getBrandName } from "@/lib/metadata";

import { NewsletterArchiveContent } from "./NewsletterArchiveContent";

interface NewsletterPageProps {
  params: Promise<{ slug: string }>;
}

export default async function NewsletterPage({ params }: NewsletterPageProps) {
  const { slug } = await params;
  const newsletter = await getNewsletterArchiveBySlug(slug);

  if (!newsletter) {
    notFound();
  }

  return <NewsletterArchiveContent newsletter={toNewsletterDetail(newsletter)} slug={slug} />;
}

export async function generateMetadata({ params }: NewsletterPageProps): Promise<Metadata> {
  const { slug } = await params;
  const [newsletter, brandName] = await Promise.all([
    getNewsletterArchiveBySlug(slug),
    getBrandName(),
  ]);

  if (!newsletter) {
    return { title: `Newsletter Not Found | ${brandName}` };
  }

  return {
    title: `${newsletter.subject} | ${brandName}`,
    description: newsletter.previewText ?? undefined,
  };
}
