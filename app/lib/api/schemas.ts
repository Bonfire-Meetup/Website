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
