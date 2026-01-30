import { desc, eq } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { newsletterArchive } from "@/lib/data/schema";
import { decompressUuid } from "@/lib/utils/uuid-compress";

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

export const getNewsletterArchiveList = async (limit = 20, offset = 0) => {
  const database = db();

  const records = await database.query.newsletterArchive.findMany({
    orderBy: desc(newsletterArchive.sentAt),
    limit,
    offset,
  });

  return records;
};
