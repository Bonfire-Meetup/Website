"use server";

import { checkBotId } from "botid/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import {
  allEvents,
  getEventById,
  isTbaDate,
  parseEventDateTimeParts,
} from "@/data/events-calendar";

import { WEBSITE_URLS } from "../config/constants";
import { serverEnv } from "../config/env";
import { insertContactSubmission, insertTalkProposal } from "../data/forms";
import { sha256WithSalt } from "../utils/hash";
import { logError, logInfo, logWarn } from "../utils/log";

const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX_CONTACT = 5;
const RATE_LIMIT_MAX_TALK = 3;
const TURNSTILE_VERIFY_URL = WEBSITE_URLS.SERVICES.TURNSTILE_VERIFY;
const CSRF_COOKIE_NAME = "bnf_csrf";

const rateLimitStore = new Map<string, number[]>();

const hashValue = (value: string) => {
  const salt = serverEnv.BNF_HEARTS_SALT;

  return sha256WithSalt(value, salt);
};

const getClientIpHash = async () => {
  const requestHeaders = await headers();
  const forwarded = requestHeaders.get("x-forwarded-for");
  const ip = requestHeaders.get("x-real-ip") || forwarded?.split(",")[0]?.trim() || "0.0.0.0";

  return hashValue(ip);
};

const isRateLimited = (key: string, maxHits: number) => {
  const now = Date.now();
  const hits = rateLimitStore.get(key)?.filter((time) => now - time < RATE_LIMIT_WINDOW_MS) ?? [];

  if (hits.length >= maxHits) {
    rateLimitStore.set(key, hits);

    return true;
  }

  hits.push(now);
  rateLimitStore.set(key, hits);

  return false;
};

const contactSchema = z.object({
  email: z.string().email("emailInvalid").max(255),
  inquiryType: z.enum(["general", "press", "crew", "coc"]).optional(),
  message: z.string().min(10, "messageRequired").max(5000),
  name: z.string().min(2, "nameRequired").max(100),
  subject: z.string().min(3, "subjectRequired").max(200),
});

const talkProposalSchema = z.object({
  abstract: z.string().min(50, "abstractRequired").max(5000),
  duration: z.enum(["15", "30", "45"], { message: "durationRequired" }),
  email: z.string().email("emailInvalid").max(255),
  experience: z.string().max(2000).optional(),
  preferredLocation: z.enum(["prague", "zlin", "either"]).optional(),
  speakerName: z.string().min(2, "nameRequired").max(100),
  talkTitle: z.string().min(5, "titleRequired").max(200),
});

const surveyFavoritePartSchema = z.enum([
  "technology_talk",
  "art_audio_management_talk",
  "interview_or_live_podcast",
  "networking_social_time",
  "other",
]);

const surveyFutureTopicSchema = z.enum([
  "technology",
  "art_animation_workflows",
  "game_audio_sound_design_music",
  "game_production_project_management",
  "game_marketing_community",
  "behind_the_scenes_interviews",
  "live_podcasts_panels",
  "other",
]);

const surveyTalkFormatSchema = z.enum([
  "perfect_as_is",
  "talks_should_be_shorter",
  "talks_could_go_deeper",
  "more_time_for_qna",
  "other",
]);

const EVENT_ID_SET = new Set(allEvents.map((event) => event.id));
const SCALE_VALUE_SCHEMA = z.enum(["0", "1", "2", "3", "4", "5"]);
const NO_ANSWER = "No answer";

const eventSurveySchema = z
  .object({
    eventId: z
      .string()
      .min(1, "eventRequired")
      .refine((value) => EVENT_ID_SET.has(value), "eventRequired"),
    favoriteParts: z.array(surveyFavoritePartSchema).max(5).default([]),
    favoritePartsOther: z.string().max(500, "otherTooLong").optional(),
    futureTopics: z.array(surveyFutureTopicSchema).max(8).default([]),
    futureTopicsOther: z.string().max(500, "otherTooLong").optional(),
    nextEventLikelihood: SCALE_VALUE_SCHEMA.optional(),
    overallRating: SCALE_VALUE_SCHEMA.optional(),
    suggestions: z.string().max(5000, "suggestionsTooLong").optional(),
    talkFeedback: z
      .array(
        z.object({
          comment: z.string().max(1000, "talkCommentTooLong").optional(),
          rating: SCALE_VALUE_SCHEMA.optional(),
          talkKey: z.string(),
        }),
      )
      .default([]),
    talkFeedbackEnabled: z.boolean().default(false),
    talkFormat: surveyTalkFormatSchema.optional(),
    talkFormatOther: z.string().max(500, "otherTooLong").optional(),
    talksOverallRating: SCALE_VALUE_SCHEMA.optional(),
  })
  .superRefine((data, ctx) => {
    const hasAnswer =
      [
        data.overallRating,
        data.talkFormat,
        data.nextEventLikelihood,
        data.talksOverallRating,
        data.suggestions?.trim(),
      ].some(Boolean) ||
      data.favoriteParts.length > 0 ||
      data.futureTopics.length > 0 ||
      data.talkFeedback.some((entry) => entry.rating || entry.comment?.trim());

    if (!hasAnswer) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "atLeastOneAnswer",
        path: ["form"],
      });
    }

    requireOtherAnswer(ctx, data.favoriteParts.includes("other"), data.favoritePartsOther, [
      "favoritePartsOther",
    ]);
    requireOtherAnswer(ctx, data.futureTopics.includes("other"), data.futureTopicsOther, [
      "futureTopicsOther",
    ]);
    requireOtherAnswer(ctx, data.talkFormat === "other", data.talkFormatOther, ["talkFormatOther"]);

    const event = getEventById(data.eventId);
    const talkCount = event?.speakers.length ?? 0;

    for (const [index, entry] of data.talkFeedback.entries()) {
      const talkIndex = Number(entry.talkKey);
      if (!Number.isInteger(talkIndex) || talkIndex < 0 || talkIndex >= talkCount) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "invalidTalkFeedback",
          path: ["talkFeedback", index, "talkKey"],
        });
      }
    }
  });

export interface ContactFormState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export interface TalkProposalFormState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export interface EventSurveyFormState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

const verifyTurnstile = async (token: FormDataEntryValue | null) => {
  const secret = serverEnv.BNF_TURNSTILE_SECRET_KEY;

  if (!token || typeof token !== "string") {
    return false;
  }

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      body: new URLSearchParams({
        response: token,
        secret,
      }),
      cache: "no-store",
      method: "POST",
    });

    if (!response.ok) {
      return false;
    }

    const data = (await response.json()) as { success?: boolean };

    return Boolean(data.success);
  } catch (error) {
    logError("form.turnstile_failed", error);

    return false;
  }
};

const verifyCsrfToken = async (token: FormDataEntryValue | null) => {
  if (!token || typeof token !== "string") {
    return false;
  }

  const cookieStore = await cookies();
  const cookieValue = cookieStore.get(CSRF_COOKIE_NAME)?.value;

  return Boolean(cookieValue && cookieValue === token);
};

export async function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const honeypot = formData.get("website");

  if (honeypot) {
    return { success: true };
  }

  const verification = await checkBotId();

  if (verification.isBot) {
    const ipHash = await getClientIpHash();
    logWarn("form.bot_blocked", { formType: "contact", ipHash });

    return { message: "botBlocked", success: false };
  }

  const ipHash = await getClientIpHash();

  if (isRateLimited(`contact:${ipHash}`, RATE_LIMIT_MAX_CONTACT)) {
    logWarn("form.rate_limited", { formType: "contact", ipHash });

    return { message: "rateLimited", success: false };
  }

  if (!(await verifyCsrfToken(formData.get("csrfToken")))) {
    logWarn("form.csrf_invalid", { formType: "contact", ipHash });

    return { message: "csrfInvalid", success: false };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    logWarn("form.captcha_failed", { formType: "contact", ipHash });

    return { message: "captchaFailed", success: false };
  }

  const rawData = {
    email: formData.get("email"),
    inquiryType: formData.get("inquiryType") || undefined,
    message: formData.get("message"),
    name: formData.get("name"),
    subject: formData.get("subject"),
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    return { errors: toActionErrors(result.error), success: false };
  }

  try {
    const { name, email, subject, message, inquiryType } = result.data;
    await insertContactSubmission({
      email: email.trim().toLowerCase(),
      inquiryType: inquiryType || "general",
      ipHash,
      message: message.trim(),
      name: name.trim(),
      subject: subject.trim(),
    });

    logInfo("form.contact_submitted", { inquiryType: inquiryType || "general", ipHash });

    return { success: true };
  } catch (error) {
    logError("form.contact_failed", error, { ipHash });

    return { message: "generic", success: false };
  }
}

export async function submitTalkProposal(
  _prevState: TalkProposalFormState,
  formData: FormData,
): Promise<TalkProposalFormState> {
  const honeypot = formData.get("company");

  if (honeypot) {
    return { success: true };
  }

  const verification = await checkBotId();

  if (verification.isBot) {
    const ipHash = await getClientIpHash();
    logWarn("form.bot_blocked", { formType: "talk_proposal", ipHash });

    return { message: "botBlocked", success: false };
  }

  const ipHash = await getClientIpHash();

  if (isRateLimited(`talk:${ipHash}`, RATE_LIMIT_MAX_TALK)) {
    logWarn("form.rate_limited", { formType: "talk_proposal", ipHash });

    return { message: "rateLimited", success: false };
  }

  if (!(await verifyCsrfToken(formData.get("csrfToken")))) {
    logWarn("form.csrf_invalid", { formType: "talk_proposal", ipHash });

    return { message: "csrfInvalid", success: false };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    logWarn("form.captcha_failed", { formType: "talk_proposal", ipHash });

    return { message: "captchaFailed", success: false };
  }

  const rawData = {
    abstract: formData.get("abstract"),
    duration: formData.get("duration"),
    email: formData.get("email"),
    experience: formData.get("experience") || undefined,
    preferredLocation: formData.get("preferredLocation") || undefined,
    speakerName: formData.get("speakerName"),
    talkTitle: formData.get("talkTitle"),
  };

  const result = talkProposalSchema.safeParse(rawData);

  if (!result.success) {
    return { errors: toActionErrors(result.error), success: false };
  }

  try {
    const { speakerName, email, talkTitle, abstract, duration, experience, preferredLocation } =
      result.data;
    await insertTalkProposal({
      abstract: abstract.trim(),
      duration,
      email: email.trim().toLowerCase(),
      experience: experience?.trim() || null,
      ipHash,
      preferredLocation: preferredLocation || "either",
      speakerName: speakerName.trim(),
      talkTitle: talkTitle.trim(),
    });

    logInfo("form.talk_proposal_submitted", {
      ipHash,
      preferredLocation: preferredLocation || "either",
    });

    return { success: true };
  } catch (error) {
    logError("form.talk_proposal_failed", error, { ipHash });

    return { message: "generic", success: false };
  }
}

const SURVEY_FAVORITE_PART_LABELS: Record<z.infer<typeof surveyFavoritePartSchema>, string> = {
  technology_talk: "Technology talk",
  art_audio_management_talk: "Art / Audio / Management talk",
  interview_or_live_podcast: "Interview or live podcast",
  networking_social_time: "Networking / social time",
  other: "Other",
};

const SURVEY_FUTURE_TOPIC_LABELS: Record<z.infer<typeof surveyFutureTopicSchema>, string> = {
  technology: "Technology (engines, tools, coding)",
  art_animation_workflows: "Art & animation workflows",
  game_audio_sound_design_music: "Game audio & sound design & music",
  game_production_project_management: "Game production & project management",
  game_marketing_community: "Game marketing & community",
  behind_the_scenes_interviews: "Behind-the-scenes interviews",
  live_podcasts_panels: "Live podcasts or panels",
  other: "Other",
};

const SURVEY_TALK_FORMAT_LABELS: Record<z.infer<typeof surveyTalkFormatSchema>, string> = {
  perfect_as_is: "Perfect as is",
  talks_should_be_shorter: "Talks should be shorter",
  talks_could_go_deeper: "Talks could go deeper / be longer",
  more_time_for_qna: "More time for Q&A",
  other: "Other",
};

function requireOtherAnswer(
  ctx: z.RefinementCtx,
  isRequired: boolean,
  value: string | undefined,
  path: string[],
) {
  if (isRequired && !value?.trim()) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "otherRequired",
      path,
    });
  }
}

function toActionErrors(error: z.ZodError): Record<string, string> {
  const errors: Record<string, string> = {};

  for (const issue of error.issues) {
    const field = issue.path[0] as string;
    errors[field] = issue.message;
  }

  return errors;
}

function parseTalkFeedbackJson(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") {
    return [];
  }

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function formatSpeakerName(name: string | string[]): string {
  return Array.isArray(name) ? name.join(", ") : name;
}

function formatEventDateTimeForSurvey(eventId: string): string {
  const event = getEventById(eventId);
  const eventDateParts =
    event && !isTbaDate(event.date) ? parseEventDateTimeParts(event.date, event.time) : null;

  return eventDateParts
    ? [
        `${eventDateParts.year}-${eventDateParts.month.toString().padStart(2, "0")}-${eventDateParts.day.toString().padStart(2, "0")}`,
        `${eventDateParts.hour.toString().padStart(2, "0")}:${eventDateParts.minute.toString().padStart(2, "0")}`,
      ].join(" ")
    : event?.date || "Unknown";
}

function formatTalkFeedbackBlock(
  eventId: string,
  talkFeedbackEnabled: boolean,
  talksOverallRating: string | undefined,
  talkFeedback: { talkKey: string; rating?: string; comment?: string }[],
): string[] {
  if (!talkFeedbackEnabled) {
    return ["Talk feedback: Not provided"];
  }

  const event = getEventById(eventId);
  const meaningfulEntries = talkFeedback.filter((entry) => entry.rating || entry.comment?.trim());

  if (!event || meaningfulEntries.length === 0) {
    return [
      "Talk feedback: Enabled",
      `Talk quality overall: ${talksOverallRating ?? NO_ANSWER}`,
      "Per-talk feedback: No answer",
    ];
  }

  return [
    "Talk feedback: Enabled",
    `Talk quality overall: ${talksOverallRating ?? NO_ANSWER}`,
    ...meaningfulEntries.map((entry) => {
      const speaker = event.speakers[Number(entry.talkKey)];
      if (!speaker) {
        return `Talk ${entry.talkKey}: Invalid`;
      }

      return [
        `${speaker.topic} (${formatSpeakerName(speaker.name)})`,
        `Rating: ${entry.rating ?? NO_ANSWER}`,
        `Comment: ${entry.comment?.trim() || NO_ANSWER}`,
      ].join(" | ");
    }),
  ];
}

function withOtherLabel(value: string, otherValue?: string) {
  if (value !== "Other") {
    return value;
  }

  const trimmedOtherValue = otherValue?.trim();
  return trimmedOtherValue ? `Other: ${trimmedOtherValue}` : value;
}

function formatSurveyMultiSelect(
  values: string[],
  labels: Record<string, string>,
  otherValue?: string,
): string {
  if (values.length === 0) {
    return NO_ANSWER;
  }

  return values
    .map((value) =>
      withOtherLabel(labels[value] || value, value === "other" ? otherValue : undefined),
    )
    .join("; ");
}

function formatSurveySingleSelect(
  value: string | undefined,
  labels: Record<string, string>,
  otherValue?: string,
): string {
  if (!value) {
    return NO_ANSWER;
  }

  return withOtherLabel(labels[value] || value, value === "other" ? otherValue : undefined);
}

function buildEventSurveyMessage(data: z.infer<typeof eventSurveySchema>): string {
  const event = getEventById(data.eventId);
  return [
    "Event survey submission",
    "",
    `Event: ${event?.title || data.eventId}`,
    `Event date: ${formatEventDateTimeForSurvey(data.eventId)}`,
    `Overall enjoyment: ${data.overallRating ?? NO_ANSWER}`,
    `Favorite parts: ${formatSurveyMultiSelect(data.favoriteParts, SURVEY_FAVORITE_PART_LABELS, data.favoritePartsOther)}`,
    `Future topics: ${formatSurveyMultiSelect(data.futureTopics, SURVEY_FUTURE_TOPIC_LABELS, data.futureTopicsOther)}`,
    `Talk length and format: ${formatSurveySingleSelect(data.talkFormat, SURVEY_TALK_FORMAT_LABELS, data.talkFormatOther)}`,
    `Likelihood to attend next event: ${data.nextEventLikelihood ?? NO_ANSWER}`,
    `Suggestions: ${data.suggestions?.trim() || NO_ANSWER}`,
    "",
    ...formatTalkFeedbackBlock(
      data.eventId,
      data.talkFeedbackEnabled,
      data.talksOverallRating,
      data.talkFeedback,
    ),
  ].join("\n");
}

export async function submitEventSurvey(
  _prevState: EventSurveyFormState,
  formData: FormData,
): Promise<EventSurveyFormState> {
  const honeypot = formData.get("website");

  if (honeypot) {
    return { success: true };
  }

  const verification = await checkBotId();

  if (verification.isBot) {
    const ipHash = await getClientIpHash();
    logWarn("form.bot_blocked", { formType: "event_survey", ipHash });

    return { message: "botBlocked", success: false };
  }

  const ipHash = await getClientIpHash();

  if (isRateLimited(`event_survey:${ipHash}`, RATE_LIMIT_MAX_CONTACT)) {
    logWarn("form.rate_limited", { formType: "event_survey", ipHash });

    return { message: "rateLimited", success: false };
  }

  if (!(await verifyCsrfToken(formData.get("csrfToken")))) {
    logWarn("form.csrf_invalid", { formType: "event_survey", ipHash });

    return { message: "csrfInvalid", success: false };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    logWarn("form.captcha_failed", { formType: "event_survey", ipHash });

    return { message: "captchaFailed", success: false };
  }

  const rawData = {
    eventId: formData.get("eventId"),
    favoriteParts: formData.getAll("favoriteParts"),
    favoritePartsOther: formData.get("favoritePartsOther") || undefined,
    futureTopics: formData.getAll("futureTopics"),
    futureTopicsOther: formData.get("futureTopicsOther") || undefined,
    nextEventLikelihood: formData.get("nextEventLikelihood") || undefined,
    overallRating: formData.get("overallRating") || undefined,
    suggestions: formData.get("suggestions") || undefined,
    talkFeedback: parseTalkFeedbackJson(formData.get("talkFeedbackJson")),
    talkFeedbackEnabled: formData.get("talkFeedbackEnabled") === "true",
    talkFormat: formData.get("talkFormat") || undefined,
    talkFormatOther: formData.get("talkFormatOther") || undefined,
    talksOverallRating: formData.get("talksOverallRating") || undefined,
  };

  const result = eventSurveySchema.safeParse(rawData);

  if (!result.success) {
    return { errors: toActionErrors(result.error), success: false };
  }

  try {
    const event = getEventById(result.data.eventId);

    await insertContactSubmission({
      email: "events-survey@bnf.events",
      inquiryType: "event_survey",
      ipHash,
      message: buildEventSurveyMessage(result.data),
      name: "Event survey respondent",
      subject: event ? `Event survey response: ${event.title}` : "Event survey response",
    });

    logInfo("form.event_survey_submitted", { ipHash });

    return { success: true };
  } catch (error) {
    logError("form.event_survey_failed", error, { ipHash });

    return { message: "generic", success: false };
  }
}
