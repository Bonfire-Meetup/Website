import "server-only";

import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { newsletterArchive } from "@/lib/data/schema";
import type { NewsletterSection } from "@/lib/types/newsletter";
import { compressUuid, decompressUuid } from "@/lib/utils/uuid-compress";

export interface NewsletterArchiveInput {
  subject: string;
  previewText: string;
  data: unknown;
  audienceType: string;
  recipientCount: number;
  sentBy: string;
  testSend: boolean;
}

export interface ArchiveRecord {
  id: string;
  subject: string;
  previewText: string | null;
  data: unknown;
  audienceType: string;
  recipientCount: number;
  sentBy: string | null;
  sentAt: Date;
  testSend: boolean;
}

export interface ArchiveListItem {
  id: string;
  slug: string;
  subject: string;
  previewText: string | null;
  sentAt: string;
  testSend: boolean;
}

export function toArchiveListItem(record: ArchiveRecord): ArchiveListItem {
  return {
    id: record.id,
    slug: compressUuid(record.id),
    subject: record.subject,
    previewText: record.previewText,
    sentAt: new Date(record.sentAt).toISOString(),
    testSend: record.testSend,
  };
}

export interface NewsletterDetail {
  slug: string;
  subject: string;
  previewText: string;
  sentAt: string;
  testSend: boolean;
  sections: NewsletterSection[];
}

const isSection = (value: unknown): value is NewsletterSection =>
  typeof value === "object" &&
  value !== null &&
  "id" in value &&
  "title" in value &&
  "text" in value;

export function toNewsletterDetail(record: ArchiveRecord): NewsletterDetail {
  const data = record.data as { sections?: unknown[] } | undefined;

  return {
    previewText: record.previewText ?? "",
    sections: Array.isArray(data?.sections) ? data.sections.filter(isSection) : [],
    sentAt: new Date(record.sentAt).toISOString(),
    slug: compressUuid(record.id),
    subject: record.subject,
    testSend: record.testSend,
  };
}

export const saveNewsletterToArchive = async (
  input: NewsletterArchiveInput,
): Promise<ArchiveRecord> => {
  const database = db();

  const [record] = await database
    .insert(newsletterArchive)
    .values({
      subject: input.subject,
      previewText: input.previewText,
      data: input.data,
      audienceType: input.audienceType,
      recipientCount: input.recipientCount,
      sentBy: input.sentBy,
      testSend: input.testSend,
    })
    .returning();

  return record as ArchiveRecord;
};

export const getNewsletterArchiveById = async (id: string) => {
  const database = db();

  const record = await database.query.newsletterArchive.findFirst({
    where: eq(newsletterArchive.id, id),
  });

  return record;
};

export const getNewsletterArchiveBySlug = async (slug: string) => {
  const database = db();
  const id = decompressUuid(slug);

  if (!id) {
    return null;
  }

  const record = await database.query.newsletterArchive.findFirst({
    where: eq(newsletterArchive.id, id),
  });

  return record;
};

export const getNewsletterArchiveList = async (limit = 20, offset = 0, testSend = false) => {
  const database = db();

  const records = await database.query.newsletterArchive.findMany({
    where: eq(newsletterArchive.testSend, testSend),
    orderBy: desc(newsletterArchive.sentAt),
    limit,
    offset,
  });

  return records;
};

export const deleteNewsletterBySlug = async (slug: string): Promise<boolean> => {
  const database = db();
  const id = decompressUuid(slug);

  if (!id) {
    return false;
  }

  const [deleted] = await database
    .delete(newsletterArchive)
    .where(eq(newsletterArchive.id, id))
    .returning({ id: newsletterArchive.id });

  return Boolean(deleted);
};
