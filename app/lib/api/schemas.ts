import { z } from "zod";

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
  count: z.number().int().min(0),
  hasBoosted: z.boolean(),
});

export const videoBoostMutationSchema = z.object({
  added: z.boolean().optional(),
  count: z.number().int().min(0),
  removed: z.boolean().optional(),
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
