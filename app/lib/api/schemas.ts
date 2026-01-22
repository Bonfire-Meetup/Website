import { z } from "zod";

export const videoLikeStatsSchema = z.object({
  count: z.number().int().min(0),
  hasLiked: z.boolean(),
});

export const videoLikeMutationSchema = z.object({
  count: z.number().int().min(0),
  added: z.boolean().optional(),
  removed: z.boolean().optional(),
});

export const videoBoostStatsSchema = z.object({
  count: z.number().int().min(0),
  hasBoosted: z.boolean(),
});

export const videoBoostMutationSchema = z.object({
  count: z.number().int().min(0),
  added: z.boolean().optional(),
  removed: z.boolean().optional(),
});

export const errorResponseSchema = z.object({
  error: z.string(),
});
