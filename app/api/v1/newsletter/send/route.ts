import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { signUnsubscribeToken } from "@/lib/auth/jwt";
import { USER_ROLES } from "@/lib/config/roles";
import { db } from "@/lib/data/db";
import { saveNewsletterToArchive } from "@/lib/data/newsletter-archive";
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

    const { subject, previewText = "", sections, audience, testMode } = result.data;

    try {
      const database = db();
      let recipientEmails: string[] = [];

      if (testMode) {
        const user = await database.query.appUser.findFirst({
          where: (users, { eq }) => eq(users.id, auth.userId),
        });
        if (user) {
          recipientEmails = [user.email];
        }
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

      const BASE_URL = process.env.PROD_URL ?? "https://www.bnf.events";

      const archiveRecord = await saveNewsletterToArchive({
        subject,
        previewText,
        data: { sections },
        audienceType: audience.type,
        recipientCount: recipientEmails.length,
        sentBy: auth.userId,
        testSend: testMode,
      });

      const slug = compressUuid(archiveRecord.id);
      let sentCount = 0;

      // oxlint-disable-next-line no-await-in-loop
      for (const email of recipientEmails) {
        try {
          // oxlint-disable-next-line no-await-in-loop
          const token = await signUnsubscribeToken(email);
          const unsubscribeUrl = `${BASE_URL}/newsletter/unsubscribe?token=${encodeURIComponent(token)}`;

          // oxlint-disable-next-line no-await-in-loop
          const { html, text } = await renderNewsletterTemplate({
            subject,
            previewText,
            sections,
            lang: "en",
            unsubscribeUrl,
            viewUrlSlug: slug,
          });

          // oxlint-disable-next-line no-await-in-loop
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
        }
      }

      logInfo("newsletter.sent", {
        recipientCount: sentCount,
        audienceType: audience.type,
        testMode,
        sentBy: auth.userId,
        slug,
      });

      return respond({
        ok: true,
        recipientCount: sentCount,
        testMode,
        slug,
      });
    } catch (error) {
      logError("newsletter.send_failed", error, {
        userId: auth.userId,
        subject: subject.substring(0, 50),
      });

      return respond({ error: "send_failed" }, { status: 500 });
    }
  }),
);
