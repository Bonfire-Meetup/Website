import { NextResponse } from "next/server";
import type Stripe from "stripe";

import {
  getStripe,
  getStripeWebhookSecret,
  syncGuildInvoiceFromStripe,
  syncGuildSubscriptionFromStripe,
} from "@/lib/billing/stripe";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

const getEvent = (payload: string, signature: string | null) => {
  if (!signature) {
    throw new Error("Missing Stripe signature");
  }

  return getStripe().webhooks.constructEvent(payload, signature, getStripeWebhookSecret());
};

const getUserIdFromMetadata = (event: Stripe.Event): string | null => {
  if ("metadata" in event.data.object) {
    const metadata = event.data.object.metadata as { userId?: unknown } | null;

    if (metadata && typeof metadata.userId === "string" && metadata.userId.length > 0) {
      return metadata.userId;
    }
  }

  if (
    event.type === "checkout.session.completed" &&
    typeof event.data.object.client_reference_id === "string"
  ) {
    return event.data.object.client_reference_id;
  }

  return null;
};

export const POST = (request: Request) =>
  runWithRequestContext(request, async () => {
    const payload = await request.text();
    const signature = request.headers.get("stripe-signature");

    let event: Stripe.Event;

    try {
      event = getEvent(payload, signature);
    } catch (error) {
      logWarn("stripe.webhook.invalid_signature", {
        error: error instanceof Error ? error.message : "unknown_error",
      });
      return NextResponse.json({ error: "invalid_signature" }, { status: 400 });
    }

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object;

          if (typeof session.subscription === "string") {
            const subscription = await getStripe().subscriptions.retrieve(session.subscription);
            await syncGuildSubscriptionFromStripe({
              subscription,
              userId: getUserIdFromMetadata(event),
            });
          }
          break;
        }
        case "customer.subscription.created":
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          await syncGuildSubscriptionFromStripe({
            subscription: event.data.object,
            userId: getUserIdFromMetadata(event),
          });
          break;
        }
        case "invoice.paid":
        case "invoice.payment_failed": {
          await syncGuildInvoiceFromStripe(event.data.object);
          break;
        }
        default:
          logInfo("stripe.webhook.ignored", { type: event.type });
      }

      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("stripe.webhook.failed", error, { type: event.type });
      return NextResponse.json({ error: "webhook_failed" }, { status: 500 });
    }
  });
