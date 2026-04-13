import { NextResponse } from "next/server";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import {
  guildSubscriptionSyncRequestSchema,
  guildSubscriptionSyncResponseSchema,
} from "@/lib/api/schemas";
import { getStripe, syncGuildSubscriptionFromStripe } from "@/lib/billing/stripe";
import { getGuildSubscriptionByUserId } from "@/lib/data/subscriptions";
import { logError, logWarn } from "@/lib/utils/log";

export const POST = withRequestContext(
  withAuth("account.subscription.sync")(async (request: Request, { auth }) => {
    const raw = await request.text();
    let payload: unknown;
    try {
      payload = raw.length > 0 ? (JSON.parse(raw) as unknown) : {};
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const parsed = guildSubscriptionSyncRequestSchema.safeParse(payload);

    if (!parsed.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      if (parsed.data.checkoutSessionId) {
        const session = await getStripe().checkout.sessions.retrieve(parsed.data.checkoutSessionId);
        const metadataUserId =
          session.metadata && typeof session.metadata.userId === "string"
            ? session.metadata.userId
            : null;

        if (session.client_reference_id !== auth.userId && metadataUserId !== auth.userId) {
          logWarn("account.subscription.sync.forbidden", {
            authenticatedUserId: auth.userId,
            checkoutSessionId: parsed.data.checkoutSessionId,
            clientReferenceId: session.client_reference_id,
            metadataUserId,
          });
          return NextResponse.json({ error: "forbidden" }, { status: 403 });
        }

        if (typeof session.subscription !== "string") {
          return NextResponse.json(guildSubscriptionSyncResponseSchema.parse({ ok: true }));
        }

        const subscription = await getStripe().subscriptions.retrieve(session.subscription);
        await syncGuildSubscriptionFromStripe({
          subscription,
          userId: auth.userId,
        });

        return NextResponse.json(guildSubscriptionSyncResponseSchema.parse({ ok: true }));
      }

      const existing = await getGuildSubscriptionByUserId(auth.userId);

      if (!existing?.stripeSubscriptionId) {
        return NextResponse.json(guildSubscriptionSyncResponseSchema.parse({ ok: true }));
      }

      const subscription = await getStripe().subscriptions.retrieve(existing.stripeSubscriptionId);
      await syncGuildSubscriptionFromStripe({
        subscription,
        userId: auth.userId,
      });

      return NextResponse.json(guildSubscriptionSyncResponseSchema.parse({ ok: true }));
    } catch (error) {
      logError("account.subscription.sync.failed", error, {
        checkoutSessionId: parsed.data.checkoutSessionId ?? null,
        userId: auth.userId,
      });
      return NextResponse.json({ error: "sync_failed" }, { status: 500 });
    }
  }),
);
