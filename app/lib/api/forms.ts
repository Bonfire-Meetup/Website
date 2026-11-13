"use client";

import { API_ROUTES } from "@/lib/api/routes";

export interface FormSubmissionState {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
}

export type ContactFormState = FormSubmissionState;
export type TalkProposalFormState = FormSubmissionState;
export type EventSurveyFormState = FormSubmissionState;

const ERROR_MESSAGES: Record<string, string> = {
  bot_blocked: "botBlocked",
  captcha_failed: "captchaFailed",
  csrf_invalid: "csrfInvalid",
  invalid_origin: "csrfInvalid",
  rate_limited: "rateLimited",
};

const text = (formData: FormData, key: string) => {
  const value = formData.get(key);

  return typeof value === "string" && value.trim() ? value : undefined;
};

const rating = (value: unknown) =>
  typeof value === "string" && value !== "" ? Number(value) : undefined;

const security = (formData: FormData) => ({
  csrfToken: text(formData, "csrfToken") ?? "",
  turnstileToken: text(formData, "cf-turnstile-response") ?? "",
});

async function postForm(
  url: string,
  csrfToken: string,
  payload: Record<string, unknown>,
): Promise<FormSubmissionState> {
  try {
    const response = await fetch(url, {
      body: JSON.stringify(payload),
      headers: { "Content-Type": "application/json", "X-CSRF-Token": csrfToken },
      method: "POST",
    });

    if (response.ok) {
      return { success: true };
    }

    const data = (await response.json().catch(() => ({}))) as {
      error?: string;
      fields?: Record<string, string>;
    };

    if (data.error === "invalid_request" && data.fields) {
      const { turnstileToken, ...errors } = data.fields;

      return turnstileToken
        ? { message: "captchaFailed", success: false }
        : { errors, success: false };
    }

    return { message: ERROR_MESSAGES[data.error ?? ""] ?? "generic", success: false };
  } catch {
    return { message: "generic", success: false };
  }
}

export function submitContactForm(
  _prevState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const { csrfToken, turnstileToken } = security(formData);

  return postForm(API_ROUTES.CONTACT_MESSAGES, csrfToken, {
    email: text(formData, "email") ?? "",
    inquiryType: text(formData, "inquiryType"),
    message: text(formData, "message") ?? "",
    name: text(formData, "name") ?? "",
    subject: text(formData, "subject") ?? "",
    turnstileToken,
    website: text(formData, "website"),
  });
}

export function submitTalkProposal(
  _prevState: TalkProposalFormState,
  formData: FormData,
): Promise<TalkProposalFormState> {
  const { csrfToken, turnstileToken } = security(formData);

  return postForm(API_ROUTES.TALK_PROPOSALS, csrfToken, {
    abstract: text(formData, "abstract") ?? "",
    company: text(formData, "company"),
    duration: text(formData, "duration"),
    email: text(formData, "email") ?? "",
    experience: text(formData, "experience"),
    preferredLocation: text(formData, "preferredLocation"),
    speakerName: text(formData, "speakerName") ?? "",
    talkTitle: text(formData, "talkTitle") ?? "",
    turnstileToken,
  });
}

function parseTalkFeedback(formData: FormData) {
  try {
    const parsed: unknown = JSON.parse(text(formData, "talkFeedbackJson") ?? "[]");

    if (!Array.isArray(parsed)) {
      return [];
    }

    return parsed.map((entry: { talkKey?: unknown; rating?: unknown; comment?: unknown }) => ({
      comment: typeof entry.comment === "string" ? entry.comment : undefined,
      rating: rating(entry.rating),
      talkIndex: Number(entry.talkKey),
    }));
  } catch {
    return [];
  }
}

export async function submitEventSurvey(
  _prevState: EventSurveyFormState,
  formData: FormData,
): Promise<EventSurveyFormState> {
  const eventId = text(formData, "eventId");

  if (!eventId) {
    return { errors: { eventId: "eventRequired" }, success: false };
  }

  const { csrfToken, turnstileToken } = security(formData);
  const result = await postForm(API_ROUTES.EVENTS.SURVEY_RESPONSES(eventId), csrfToken, {
    favoriteParts: formData.getAll("favoriteParts"),
    favoritePartsOther: text(formData, "favoritePartsOther"),
    futureTopics: formData.getAll("futureTopics"),
    futureTopicsOther: text(formData, "futureTopicsOther"),
    nextEventLikelihood: rating(formData.get("nextEventLikelihood")),
    overallRating: rating(formData.get("overallRating")),
    suggestions: text(formData, "suggestions"),
    talkFeedback: parseTalkFeedback(formData),
    talkFeedbackEnabled: formData.get("talkFeedbackEnabled") === "true",
    talkFormat: text(formData, "talkFormat"),
    talkFormatOther: text(formData, "talkFormatOther"),
    talksOverallRating: rating(formData.get("talksOverallRating")),
    turnstileToken,
    website: text(formData, "website"),
  });

  return result;
}
