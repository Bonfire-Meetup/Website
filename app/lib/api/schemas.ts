import { z } from "zod";

import { BOOST_CONFIG } from "@/lib/config/constants";

export const videoLikeStatsSchema = z.object({
  count: z.number().int().min(0),
  hasLiked: z.boolean(),
});

export const videoLikeMutationSchema = z.object({
  added: z.boolean().optional(),
  count: z.number().int().min(0),
  removed: z.boolean().optional(),
});

export const videoBoostStatsSchema = z.object({
  availableBoosts: z.number().int().min(0).max(BOOST_CONFIG.MAX_BOOSTS).optional(),
  boostedBy: z
    .object({
      privateCount: z.number().int().min(0),
      publicUsers: z.array(
        z.object({
          name: z.string().nullable(),
          publicId: z
            .string()
            .regex(/^[1-9A-HJ-NP-Za-km-z]{11}-[1-9A-HJ-NP-Za-km-z]{11}$/, "Invalid user ID"),
        }),
      ),
    })
    .optional(),
  count: z.number().int().min(0),
  hasBoosted: z.boolean(),
});

export const videoBoostMutationSchema = z.object({
  added: z.boolean().optional(),
  count: z.number().int().min(0),
  removed: z.boolean().optional(),
  availableBoosts: z.number().int().min(0).max(BOOST_CONFIG.MAX_BOOSTS).optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});

export const newsletterSubscribeRequestSchema = z.object({
  email: z.string().email().min(1).max(255),
});

export const newsletterSubscribeResponseSchema = z.object({
  subscribed: z.boolean(),
});

export const guildSubscriptionCheckoutRequestSchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
});

export const guildSubscriptionLinkResponseSchema = z.object({
  url: z.string().url(),
});

export const guildSubscriptionSyncRequestSchema = z.object({
  checkoutSessionId: z.string().min(1).optional(),
});

export const guildSubscriptionSyncResponseSchema = z.object({
  ok: z.boolean(),
});

export const guildSubscriptionChargeSchema = z.object({
  amount: z.number().int().nonnegative(),
  currency: z.string().min(1),
  paidAt: z.string().datetime().nullable().optional(),
  dueAt: z.string().datetime().nullable().optional(),
  status: z.string().nullable().optional(),
});

export const guildSubscriptionSummarySchema = z.object({
  tier: z.union([z.literal(1), z.literal(2), z.literal(3)]).nullable(),
  status: z.string().nullable(),
  isActive: z.boolean(),
  cancelAtPeriodEnd: z.boolean(),
  scheduledChange: z
    .object({
      tier: z.union([z.literal(1), z.literal(2), z.literal(3)]),
      effectiveAt: z.string().datetime(),
    })
    .nullable(),
  currentPeriodStart: z.string().datetime().nullable(),
  currentPeriodEnd: z.string().datetime().nullable(),
  lastCharge: guildSubscriptionChargeSchema.nullable(),
  upcomingCharge: guildSubscriptionChargeSchema.nullable(),
});

export const eventQuestionCreateSchema = z.object({
  locale: z.enum(["en", "cs"]).optional(),
  talkIndex: z.number().int().min(0).nullable().optional(),
  text: z.string().min(3).max(600),
});
