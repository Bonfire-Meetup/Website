import { getDatabaseClient } from "@/lib/data/db";
import { logError } from "@/lib/utils/log";

export async function subscribeToNewsletter(email: string, ipHash: string, uaHash: string) {
  const db = getDatabaseClient();

  try {
    const normalizedEmail = email.toLowerCase().trim();

    const existing = await db`
      select id from newsletter_subscription
      where email = ${normalizedEmail}
      limit 1
    `;

    if (existing.length > 0) {
      return { alreadyExists: true, subscribed: true };
    }

    await db`
      insert into newsletter_subscription (email, ip_hash, user_agent_hash)
      values (${normalizedEmail}, ${ipHash}, ${uaHash})
    `;

    return { alreadyExists: false, subscribed: true };
  } catch (error: unknown) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      return { alreadyExists: true, subscribed: true };
    }

    logError("newsletter.subscribe_failed", error, { email: email.substring(0, 10) });
    throw error;
  }
}
