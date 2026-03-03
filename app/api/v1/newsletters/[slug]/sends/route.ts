import { NextResponse } from "next/server";
import { z } from "zod";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { getNewsletterArchiveBySlug } from "@/lib/data/newsletter-archive";
import { logError } from "@/lib/utils/log";

import {
  audienceSchema,
  resolveAudienceEmails,
  sectionSchema,
  streamNewsletter,
} from "../../newsletter-stream";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

const resendSchema = z.object({
  audience: audienceSchema,
  testMode: z.boolean().default(false),
});

export const POST = withRequestContext(
  withRole<RouteParams>(
    "newsletter.send",
    USER_ROLES.EDITOR,
  )(async (request: Request, { params, auth }) => {
    const { slug } = await params;
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const result = resendSchema.safeParse(payload);
    if (!result.success) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { audience, testMode } = result.data;

    let subject: string;
    let previewText: string;
    let sections: z.infer<typeof sectionSchema>[];
    let recipientEmails: string[];

    try {
      const original = await getNewsletterArchiveBySlug(slug);
      if (!original) {
        return respond({ error: "not_found" }, { status: 404 });
      }

      const rawData = original.data as { sections?: unknown[] } | null;
      const parsed = z.array(sectionSchema).safeParse(rawData?.sections ?? []);
      if (!parsed.success || parsed.data.length === 0) {
        return respond({ error: "invalid_archive" }, { status: 422 });
      }

      ({ subject } = original);
      previewText = original.previewText ?? "";
      sections = parsed.data;

      const resolved = await resolveAudienceEmails(audience, testMode, auth.userId);
      if (!resolved.ok) {
        return respond({ error: resolved.error }, { status: resolved.status });
      }
      recipientEmails = resolved.emails;

      if (recipientEmails.length === 0) {
        return respond({ error: "no_recipients" }, { status: 400 });
      }
    } catch (error) {
      logError("newsletter.resend_failed", error, { userId: auth.userId, slug });
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
