import type { Metadata } from "next";

import { getNewsletterArchiveList } from "@/lib/data/newsletter-archive";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { NewsletterArchiveClient } from "./NewsletterArchiveClient";

export default async function NewsletterArchivePage() {
  const [records] = await Promise.all([getNewsletterArchiveList(40, 0)]);
  const visibleRecords = records.filter((record) => !record.testSend);
  const items = visibleRecords.map((record) => ({
    id: record.id,
    subject: record.subject,
    previewText: record.previewText,
    sentAt: String(record.sentAt),
  }));

  return <NewsletterArchiveClient items={items} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "sections.newsletterArchiveIndex" });
}
