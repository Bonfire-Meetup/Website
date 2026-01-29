import { eq } from "drizzle-orm";

import { db } from "@/lib/data/db";
import { newsletterSubscription } from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

export async function subscribeToNewsletter(email: string, ipHash: string, uaHash: string) {
  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db()
      .select({ id: newsletterSubscription.id })
      .from(newsletterSubscription)
      .where(eq(newsletterSubscription.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return { alreadyExists: true, subscribed: true };
    }

    await db().insert(newsletterSubscription).values({
      email: normalizedEmail,
      ipHash,
      userAgentHash: uaHash,
    });

    return { alreadyExists: false, subscribed: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { alreadyExists: true, subscribed: true };
    }

    logError("newsletter.subscribe_failed", error, { email: email.substring(0, 10) });
    throw error;
  }
}
