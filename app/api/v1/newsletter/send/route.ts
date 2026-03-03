import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { signUnsubscribeToken } from "@/lib/auth/jwt";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { USER_ROLES } from "@/lib/config/roles";
import { db } from "@/lib/data/db";
import { getNewsletterArchiveBySlug, saveNewsletterToArchive } from "@/lib/data/newsletter-archive";
import { appUser, newsletterSubscription } from "@/lib/data/schema";
import { getNewsletterFrom, sendEmail } from "@/lib/email/email";
import { renderNewsletterTemplate } from "@/lib/email/newsletter-template";
import { logError, logInfo } from "@/lib/utils/log";
import { compressUuid } from "@/lib/utils/uuid-compress";

const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

const sendSchema = z.object({
  subject: z.string().min(1),
  previewText: z.string().optional(),
  sections: z.array(sectionSchema).min(1),
  audience: z.object({
    type: z.enum(["all", "subscribers", "registered", "manual"]),
    manualEmails: z.array(z.string().email()).default([]),
  }),
  testMode: z.boolean().default(false),
  // When resending an existing newsletter, pass its slug to reuse the same archive record/URL.
  resendSlug: z.string().optional(),
});

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

    const result = sendSchema.safeParse(payload);
    if (!result.success) {
      return respond({ error: "invalid_request" }, { status: 400 });
    }

    const { audience, testMode, resendSlug } = result.data;
    // Content may be overridden from the archive DB when resending.
    let { subject } = result.data;
    let previewText = result.data.previewText ?? "";
    let { sections } = result.data;

    let recipientEmails: string[] = [];
    let slug: string;

    try {
      const database = db();

      // In resend mode, load the original content from the archive so the email is
      // Identical to the original — the client-supplied content is ignored.
      if (resendSlug) {
        const original = await getNewsletterArchiveBySlug(resendSlug);
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
      }

      if (testMode) {
        const user = await database.query.appUser.findFirst({
          where: (users, { eq }) => eq(users.id, auth.userId),
        });
        if (!user) {
          return respond({ error: "user_not_found" }, { status: 400 });
        }
        recipientEmails = [user.email];
      } else {
        switch (audience.type) {
          case "all": {
            const [subscribers, users] = await Promise.all([
              database.select({ email: newsletterSubscription.email }).from(newsletterSubscription),
              database
                .select({ email: appUser.email })
                .from(appUser)
                .where(sql`(${appUser.preferences}->>'allowCommunityEmails')::boolean = true`),
            ]);
            const subscriberEmails = subscribers.map((s) => s.email.toLowerCase());
            const userEmails = users.map((u) => u.email.toLowerCase());
            recipientEmails = Array.from(new Set([...subscriberEmails, ...userEmails]));
            break;
          }
          case "subscribers": {
            const subscribers = await database
              .select({ email: newsletterSubscription.email })
              .from(newsletterSubscription);
            recipientEmails = subscribers.map((s) => s.email.toLowerCase());
            break;
          }
          case "registered": {
            const users = await database
              .select({ email: appUser.email })
              .from(appUser)
              .where(sql`(${appUser.preferences}->>'allowCommunityEmails')::boolean = true`);
            recipientEmails = users.map((u) => u.email.toLowerCase());
            break;
          }
          case "manual": {
            recipientEmails = audience.manualEmails.map((e) => e.toLowerCase());
            break;
          }
        }

        if (audience.manualEmails.length > 0 && audience.type !== "manual") {
          const manualEmails = audience.manualEmails.map((e) => e.toLowerCase());
          recipientEmails = Array.from(new Set([...recipientEmails, ...manualEmails]));
        }
      }

      if (recipientEmails.length === 0) {
        return respond({ error: "no_recipients" }, { status: 400 });
      }

      if (resendSlug) {
        slug = resendSlug;
      } else {
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
      }
    } catch (error) {
      logError("newsletter.send_failed", error, {
        userId: auth.userId,
        subject: subject.substring(0, 50),
      });

      return respond({ error: "send_failed" }, { status: 500 });
    }

    // Resend allows 2 requests/second. We budget 550 ms per send so we stay safely under the limit.
    const RESEND_DELAY_MS = 550;
    const total = recipientEmails.length;
    const BASE_URL = process.env.PROD_URL ?? WEBSITE_URLS.BASE;
    const encoder = new TextEncoder();
    const enqueue = (controller: ReadableStreamDefaultController, data: object) => {
      controller.enqueue(encoder.encode(`${JSON.stringify(data)}\n`));
    };

    const stream = new ReadableStream({
      async start(controller) {
        let sentCount = 0;
        let errorCount = 0;

        for (let i = 0; i < recipientEmails.length; i++) {
          const email = recipientEmails[i];
          const sendStart = Date.now();

          try {
            // eslint-disable-next-line no-await-in-loop
            const token = await signUnsubscribeToken(email);
            const unsubscribeUrl = `${BASE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;

            // eslint-disable-next-line no-await-in-loop
            const { html, text } = await renderNewsletterTemplate({
              subject,
              previewText,
              sections,
              lang: "en",
              unsubscribeUrl,
              viewUrlSlug: slug,
            });

            // eslint-disable-next-line no-await-in-loop
            await sendEmail({
              from: getNewsletterFrom(),
              to: email,
              subject,
              html,
              text,
              tags: [{ name: "type", value: testMode ? "newsletter_test" : "newsletter" }],
            });

            sentCount += 1;
          } catch (error) {
            logError("newsletter.send_single_failed", error, { email });
            errorCount += 1;
          }

          enqueue(controller, { sent: sentCount + errorCount, total });

          // Rate-limit: wait out the remainder of the 550 ms budget before the next send.
          if (i < recipientEmails.length - 1) {
            const elapsed = Date.now() - sendStart;
            const remaining = RESEND_DELAY_MS - elapsed;
            if (remaining > 0) {
              // eslint-disable-next-line no-await-in-loop
              await new Promise<void>((resolve) => {
                setTimeout(resolve, remaining);
              });
            }
          }
        }

        logInfo("newsletter.sent", {
          recipientCount: sentCount,
          audienceType: audience.type,
          testMode,
          sentBy: auth.userId,
          slug,
        });

        enqueue(controller, { done: true, sentCount, errorCount, testMode, slug });
        controller.close();
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "application/x-ndjson" },
    });
  }),
);
