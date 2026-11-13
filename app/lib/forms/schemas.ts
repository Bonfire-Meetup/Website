import { z } from "zod";

export const CONTACT_INQUIRY_TYPES = [
  "general",
  "feature",
  "support",
  "press",
  "crew",
  "coc",
] as const;

export const contactMessageCreateSchema = z.object({
  email: z.string({ error: "emailInvalid" }).trim().email("emailInvalid").max(255),
  inquiryType: z.enum(CONTACT_INQUIRY_TYPES).default("general"),
  message: z.string({ error: "messageRequired" }).trim().min(10, "messageRequired").max(5000),
  name: z.string({ error: "nameRequired" }).trim().min(2, "nameRequired").max(100),
  subject: z.string({ error: "subjectRequired" }).trim().min(3, "subjectRequired").max(200),
  turnstileToken: z.string().min(1),
  website: z.string().optional(),
});

export const talkProposalCreateSchema = z.object({
  abstract: z.string({ error: "abstractRequired" }).trim().min(50, "abstractRequired").max(5000),
  company: z.string().optional(),
  duration: z.enum(["15", "30", "45"], { message: "durationRequired" }),
  email: z.string({ error: "emailInvalid" }).trim().email("emailInvalid").max(255),
  experience: z.string().trim().max(2000).optional(),
  preferredLocation: z.enum(["prague", "zlin", "either"]).default("either"),
  speakerName: z.string({ error: "nameRequired" }).trim().min(2, "nameRequired").max(100),
  talkTitle: z.string({ error: "titleRequired" }).trim().min(5, "titleRequired").max(200),
  turnstileToken: z.string().min(1),
});

export const SURVEY_FAVORITE_PARTS = [
  "technology_talk",
  "art_audio_management_talk",
  "interview_or_live_podcast",
  "networking_social_time",
  "other",
] as const;

export const SURVEY_FUTURE_TOPICS = [
  "technology",
  "art_animation_workflows",
  "game_audio_sound_design_music",
  "game_production_project_management",
  "game_marketing_community",
  "behind_the_scenes_interviews",
  "live_podcasts_panels",
  "other",
] as const;

export const SURVEY_TALK_FORMATS = [
  "perfect_as_is",
  "talks_should_be_shorter",
  "talks_could_go_deeper",
  "more_time_for_qna",
  "other",
] as const;

const surveyRatingSchema = z.number().int().min(0).max(5);

const requireOtherAnswer = (
  ctx: z.RefinementCtx,
  isRequired: boolean,
  value: string | undefined,
  path: string,
) => {
  if (isRequired && !value?.trim()) {
    ctx.addIssue({ code: "custom", message: "otherRequired", path: [path] });
  }
};

export const eventSurveyResponseCreateSchema = z
  .object({
    favoriteParts: z.array(z.enum(SURVEY_FAVORITE_PARTS)).max(5).default([]),
    favoritePartsOther: z.string().trim().max(500, "otherTooLong").optional(),
    futureTopics: z.array(z.enum(SURVEY_FUTURE_TOPICS)).max(8).default([]),
    futureTopicsOther: z.string().trim().max(500, "otherTooLong").optional(),
    nextEventLikelihood: surveyRatingSchema.optional(),
    overallRating: surveyRatingSchema.optional(),
    suggestions: z.string().trim().max(5000, "suggestionsTooLong").optional(),
    talkFeedback: z
      .array(
        z.object({
          comment: z.string().trim().max(1000, "talkCommentTooLong").optional(),
          rating: surveyRatingSchema.optional(),
          talkIndex: z.number().int().min(0),
        }),
      )
      .max(50)
      .default([]),
    talkFeedbackEnabled: z.boolean().default(false),
    talkFormat: z.enum(SURVEY_TALK_FORMATS).optional(),
    talkFormatOther: z.string().trim().max(500, "otherTooLong").optional(),
    talksOverallRating: surveyRatingSchema.optional(),
    turnstileToken: z.string().min(1),
    website: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnswer = [
      data.overallRating !== undefined,
      data.nextEventLikelihood !== undefined,
      data.talksOverallRating !== undefined,
      Boolean(data.talkFormat),
      Boolean(data.suggestions),
      data.favoriteParts.length > 0,
      data.futureTopics.length > 0,
      data.talkFeedback.some((entry) => entry.rating !== undefined || entry.comment),
    ].some(Boolean);

    if (!hasAnswer) {
      ctx.addIssue({ code: "custom", message: "atLeastOneAnswer", path: ["form"] });
    }

    requireOtherAnswer(
      ctx,
      data.favoriteParts.includes("other"),
      data.favoritePartsOther,
      "favoritePartsOther",
    );
    requireOtherAnswer(
      ctx,
      data.futureTopics.includes("other"),
      data.futureTopicsOther,
      "futureTopicsOther",
    );
    requireOtherAnswer(ctx, data.talkFormat === "other", data.talkFormatOther, "talkFormatOther");
  });

export type ContactMessageCreate = z.input<typeof contactMessageCreateSchema>;
export type TalkProposalCreate = z.input<typeof talkProposalCreateSchema>;
export type EventSurveyResponseCreate = z.input<typeof eventSurveyResponseCreateSchema>;

export function toFieldErrors(error: z.ZodError): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = String(issue.path[0] ?? "form");
    fields[field] ??= issue.message;
  }

  return fields;
}
