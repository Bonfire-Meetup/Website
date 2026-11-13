import { NextResponse } from "next/server";

import { getEventById } from "@/data/events-calendar";
import { rejectUnverifiedSubmission } from "@/lib/api/form-protection";
import { getClientHashes } from "@/lib/api/rate-limit";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { insertEventSurveyResponse } from "@/lib/data/forms";
import type { EventSurveyTalkFeedback } from "@/lib/data/schema";
import type { EventItem } from "@/lib/events/types";
import { eventSurveyResponseCreateSchema, toFieldErrors } from "@/lib/forms/schemas";
import { logError, logInfo } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ eventId: string }>;
}
type SurveyAnswers = ReturnType<typeof eventSurveyResponseCreateSchema.parse>;

const MAX_RESPONSES_PER_HOUR = 5;

const otherText = (selected: boolean, value: string | undefined) =>
  selected ? value || null : null;

function buildTalkFeedback(event: EventItem, answers: SurveyAnswers): EventSurveyTalkFeedback[] {
  if (!answers.talkFeedbackEnabled) {
    return [];
  }

  return answers.talkFeedback
    .filter((entry) => entry.rating !== undefined || entry.comment)
    .map((entry) => {
      const speaker = event.speakers[entry.talkIndex];

      return {
        comment: entry.comment || null,
        rating: entry.rating ?? null,
        speaker: Array.isArray(speaker.name) ? speaker.name.join(", ") : speaker.name,
        talkIndex: entry.talkIndex,
        topic: speaker.topic,
      };
    });
}

/**
 * Submits the feedback survey for an event.
 *
 * Every answer is optional, but at least one is required. Ratings are 0–5. `talkIndex` is the
 * talk's position in the event's lineup. Requires a Cloudflare Turnstile token and the CSRF
 * token from `GET /api/v1/csrf` in the `X-CSRF-Token` header.
 */
export const POST = withRequestContext(
  withRateLimit<RouteParams>({
    maxHits: MAX_RESPONSES_PER_HOUR,
    storeKey: "survey-responses",
    windowSeconds: 3600,
  })(async (request: Request, { params }: RouteParams) => {
    const { eventId } = await params;
    const event = getEventById(eventId);

    if (!event) {
      return NextResponse.json({ error: "event_not_found" }, { status: 404 });
    }

    const body = (await request.json().catch(() => null)) as { website?: unknown } | null;

    if (body?.website) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const parsed = eventSurveyResponseCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", fields: toFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const answers = parsed.data;

    if (answers.talkFeedback.some((entry) => entry.talkIndex >= event.speakers.length)) {
      return NextResponse.json(
        { error: "invalid_request", fields: { talkFeedback: "invalidTalkFeedback" } },
        { status: 400 },
      );
    }

    const rejected = await rejectUnverifiedSubmission(
      request,
      "event_survey",
      answers.turnstileToken,
    );

    if (rejected) {
      return rejected;
    }

    const { ipHash } = await getClientHashes();

    try {
      await insertEventSurveyResponse({
        eventId,
        eventTitle: event.title,
        favoriteParts: answers.favoriteParts,
        favoritePartsOther: otherText(
          answers.favoriteParts.includes("other"),
          answers.favoritePartsOther,
        ),
        futureTopics: answers.futureTopics,
        futureTopicsOther: otherText(
          answers.futureTopics.includes("other"),
          answers.futureTopicsOther,
        ),
        ipHash,
        nextEventLikelihood: answers.nextEventLikelihood ?? null,
        overallRating: answers.overallRating ?? null,
        suggestions: answers.suggestions || null,
        talkFeedback: buildTalkFeedback(event, answers),
        talkFeedbackEnabled: answers.talkFeedbackEnabled,
        talkFormat: answers.talkFormat ?? null,
        talkFormatOther: otherText(answers.talkFormat === "other", answers.talkFormatOther),
        talksOverallRating: answers.talkFeedbackEnabled
          ? (answers.talksOverallRating ?? null)
          : null,
      });
      logInfo("form.event_survey_submitted", { eventId, ipHash });

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      logError("form.event_survey_failed", error, { eventId, ipHash });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
