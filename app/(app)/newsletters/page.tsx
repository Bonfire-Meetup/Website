import type { Metadata } from "next";

import { getNewsletterArchiveList, toArchiveListItem } from "@/lib/data/newsletter-archive";
import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { NewsletterArchiveClient } from "./NewsletterArchiveClient";

export default async function NewsletterArchivePage() {
  const records = await getNewsletterArchiveList(40, 0);
  const items = records.filter((r) => !r.testSend).map(toArchiveListItem);

  return <NewsletterArchiveClient items={items} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "sections.newsletterArchiveIndex" });
}
