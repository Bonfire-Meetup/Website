import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { requireRole } from "@/lib/api/auth";
import { parsePagination } from "@/lib/api/pagination";
import { withRateLimit, withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import {
  getNewsletterArchiveList,
  saveNewsletterToArchive,
  toArchiveListItem,
} from "@/lib/data/newsletter-archive";
import { logError } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

import {
  audienceSchema,
  resolveAudienceEmails,
  sectionSchema,
  streamNewsletter,
} from "./newsletter-stream";

/**
 * Lists sent newsletters, newest first. Paginate with `limit` and `offset`.
 *
 * Pass `testSend=true` to list test sends instead; that requires the `editor` role.
 */
export const GET = withRequestContext(
  withRateLimit({ maxHits: 60, storeKey: "newsletters" })(async (request: NextRequest) => {
    const { searchParams } = request.nextUrl;
    const testSend = searchParams.get("testSend") === "true";

    if (testSend) {
      const auth = await requireRole(request, "newsletter.archive", USER_ROLES.EDITOR);

      if (!auth.success) {
        return auth.response;
      }
    }

    const pagination = parsePagination(searchParams);
    const records = await getNewsletterArchiveList(pagination.limit, pagination.offset, testSend);

    return NextResponse.json({ ...pagination, items: records.map(toArchiveListItem) });
  }),
);

const newSendSchema = z.object({
  subject: z.string().min(1),
  previewText: z.string().optional(),
  sections: z.array(sectionSchema).min(1),
  audience: audienceSchema,
  testMode: z.boolean().default(false),
});

/**
 * Sends a new newsletter and saves it to the archive.
 *
 * The response streams progress while the emails go out.
 */
export const POST = withRequestContext(
  withRole(
    "newsletter.send",
    USER_ROLES.EDITOR,
  )(async (request: Request, { auth }) => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = newSendSchema.safeParse(payload);
    if (!result.success) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { audience, testMode, sections, subject } = result.data;
    const previewText = result.data.previewText ?? "";

    let recipientEmails: string[];
    let slug: string;

    try {
      const resolved = await resolveAudienceEmails(audience, testMode, auth.userId);
      if (!resolved.ok) {
        return respond({ error: resolved.error }, { status: resolved.status });
      }
      recipientEmails = resolved.emails;

      if (recipientEmails.length === 0) {
        return respond({ error: "no_recipients" }, { status: 400 });
      }

      const archiveRecord = await saveNewsletterToArchive({
        subject,
        previewText,
        data: { sections },
        audienceType: audience.type,
        recipientCount: recipientEmails.length,
        sentBy: auth.userId,
        testSend: testMode,
      });
      slug = compressUuid(archiveRecord.id);
    } catch (error) {
      logError("newsletter.send_failed", error, {
        userId: auth.userId,
        subject: subject.substring(0, 50),
      });
      return respond({ error: "send_failed" }, { status: 500 });
    }

    return streamNewsletter({
      audienceType: audience.type,
      auth,
      previewText,
      recipientEmails,
      sections,
      slug,
      subject,
      testMode,
    });
  }),
);
