import { sql } from "drizzle-orm";
import { z } from "zod";

import { signUnsubscribeToken } from "@/lib/auth/jwt";
import { WEBSITE_URLS } from "@/lib/config/constants";
import { db } from "@/lib/data/db";
import { appUser, newsletterSubscription } from "@/lib/data/schema";
import {
  type SendEmailInput,
  EmailSendError,
  getNewsletterFrom,
  sendEmail,
} from "@/lib/email/email";
import { renderNewsletterTemplate } from "@/lib/email/newsletter-template";
import { logError, logInfo } from "@/lib/utils/log";

export const sectionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  text: z.string().min(1),
  imageUrl: z.string().optional(),
  ctaLabel: z.string().optional(),
  ctaHref: z.string().optional(),
});

export const audienceSchema = z.object({
  type: z.enum(["all", "subscribers", "registered", "manual"]),
  manualEmails: z.array(z.string().email()).default([]),
});

export type SectionData = z.infer<typeof sectionSchema>;
export type AudienceData = z.infer<typeof audienceSchema>;

type ResolveResult = { ok: true; emails: string[] } | { ok: false; error: string; status: number };

export async function resolveAudienceEmails(
  audience: AudienceData,
  testMode: boolean,
  authUserId: string,
): Promise<ResolveResult> {
  const database = db();

  if (testMode) {
    const user = await database.query.appUser.findFirst({
      where: (users, { eq }) => eq(users.id, authUserId),
    });
    if (!user) {
      return { ok: false, error: "user_not_found", status: 400 };
    }
    return { ok: true, emails: [user.email] };
  }

  let recipientEmails: string[] = [];

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

  return { ok: true, emails: recipientEmails };
}

interface StreamNewsletterParams {
  audienceType: AudienceData["type"];
  auth: { userId: string };
  previewText: string;
  recipientEmails: string[];
  sections: SectionData[];
  slug: string;
  subject: string;
  testMode: boolean;
}

// Resend allows 2 requests/second. 700 ms between calls gives comfortable headroom
// Even when concurrent auth emails share the same API key quota.
const RESEND_DELAY_MS = 700;

// Retry on 429 with exponential backoff (2 s, 4 s). All other errors propagate immediately.
const sendWithRetry = async (input: SendEmailInput): Promise<void> => {
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await sendEmail(input);
      return;
    } catch (err) {
      if (err instanceof EmailSendError && err.status === 429 && attempt < 2) {
        // eslint-disable-next-line no-await-in-loop
        await new Promise<void>((resolve) => {
          setTimeout(resolve, 2000 * (attempt + 1));
        });
      } else {
        throw err;
      }
    }
  }
};

export function streamNewsletter({
  audienceType,
  auth,
  previewText,
  recipientEmails,
  sections,
  slug,
  subject,
  testMode,
}: StreamNewsletterParams): Response {
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
      // Tracks when the last Resend API call was initiated so we can enforce the gap
      // Regardless of how long rendering takes.
      let lastSendAt = 0;

      for (const email of recipientEmails) {
        try {
          // Render phase — does not consume Resend quota.
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

          // Rate-limit: ensure at least RESEND_DELAY_MS has elapsed since the last API call.
          // Measuring after rendering means render time counts toward the gap.
          if (lastSendAt > 0) {
            const gap = Date.now() - lastSendAt;
            if (gap < RESEND_DELAY_MS) {
              // eslint-disable-next-line no-await-in-loop
              await new Promise<void>((resolve) => {
                setTimeout(resolve, RESEND_DELAY_MS - gap);
              });
            }
          }

          lastSendAt = Date.now();

          // eslint-disable-next-line no-await-in-loop
          await sendWithRetry({
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
      }

      logInfo("newsletter.sent", {
        recipientCount: sentCount,
        audienceType,
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
}
