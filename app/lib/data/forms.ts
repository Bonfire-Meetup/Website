import "server-only";

import { desc } from "drizzle-orm";

import { db } from "@/lib/data/db";
import {
  contactSubmissions,
  eventSurveyResponse,
  talkProposals,
  type EventSurveyTalkFeedback,
} from "@/lib/data/schema";
import { logError } from "@/lib/utils/log";

interface ContactSubmission {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
  ipHash: string;
}

interface TalkProposalSubmission {
  speakerName: string;
  email: string;
  talkTitle: string;
  abstract: string;
  duration: string;
  experience: string | null;
  preferredLocation: string;
  ipHash: string;
}

export const insertContactSubmission = async ({
  name,
  email,
  inquiryType,
  subject,
  message,
  ipHash,
}: ContactSubmission) => {
  try {
    await db().insert(contactSubmissions).values({
      name,
      email,
      inquiryType,
      subject,
      message,
      ipHash,
    });
  } catch (error) {
    logError("data.contact_insert_failed", error, { ipHash });
    throw error;
  }
};

interface EventSurveySubmission {
  eventId: string;
  eventTitle: string;
  overallRating: number | null;
  favoriteParts: string[];
  favoritePartsOther: string | null;
  futureTopics: string[];
  futureTopicsOther: string | null;
  talkFormat: string | null;
  talkFormatOther: string | null;
  nextEventLikelihood: number | null;
  suggestions: string | null;
  talkFeedbackEnabled: boolean;
  talksOverallRating: number | null;
  talkFeedback: EventSurveyTalkFeedback[];
  ipHash: string;
}

export const insertEventSurveyResponse = async (submission: EventSurveySubmission) => {
  try {
    await db().insert(eventSurveyResponse).values(submission);
  } catch (error) {
    logError("data.event_survey_insert_failed", error, { ipHash: submission.ipHash });
    throw error;
  }
};

export const insertTalkProposal = async ({
  speakerName,
  email,
  talkTitle,
  abstract,
  duration,
  experience,
  preferredLocation,
  ipHash,
}: TalkProposalSubmission) => {
  try {
    await db().insert(talkProposals).values({
      speakerName,
      email,
      talkTitle,
      abstract,
      duration,
      experience,
      preferredLocation,
      ipHash,
    });
  } catch (error) {
    logError("data.talk_proposal_insert_failed", error, { ipHash });
    throw error;
  }
};

const ADMIN_LIST_LIMIT = 1000;

const toIsoTimestamp = (value: string) => new Date(value).toISOString();

export const listEventSurveyResponses = async () => {
  const rows = await db()
    .select({
      createdAt: eventSurveyResponse.createdAt,
      eventId: eventSurveyResponse.eventId,
      eventTitle: eventSurveyResponse.eventTitle,
      favoriteParts: eventSurveyResponse.favoriteParts,
      favoritePartsOther: eventSurveyResponse.favoritePartsOther,
      futureTopics: eventSurveyResponse.futureTopics,
      futureTopicsOther: eventSurveyResponse.futureTopicsOther,
      id: eventSurveyResponse.id,
      nextEventLikelihood: eventSurveyResponse.nextEventLikelihood,
      overallRating: eventSurveyResponse.overallRating,
      suggestions: eventSurveyResponse.suggestions,
      talkFeedback: eventSurveyResponse.talkFeedback,
      talkFeedbackEnabled: eventSurveyResponse.talkFeedbackEnabled,
      talkFormat: eventSurveyResponse.talkFormat,
      talkFormatOther: eventSurveyResponse.talkFormatOther,
      talksOverallRating: eventSurveyResponse.talksOverallRating,
    })
    .from(eventSurveyResponse)
    .orderBy(desc(eventSurveyResponse.createdAt))
    .limit(ADMIN_LIST_LIMIT);

  return rows.map((row) => ({ ...row, createdAt: toIsoTimestamp(row.createdAt) }));
};

export const listTalkProposals = async () => {
  const rows = await db()
    .select({
      abstract: talkProposals.abstract,
      createdAt: talkProposals.createdAt,
      duration: talkProposals.duration,
      email: talkProposals.email,
      experience: talkProposals.experience,
      id: talkProposals.id,
      preferredLocation: talkProposals.preferredLocation,
      speakerName: talkProposals.speakerName,
      talkTitle: talkProposals.talkTitle,
    })
    .from(talkProposals)
    .orderBy(desc(talkProposals.createdAt))
    .limit(ADMIN_LIST_LIMIT);

  return rows.map((row) => ({ ...row, createdAt: toIsoTimestamp(row.createdAt) }));
};

export const listContactSubmissions = async () => {
  const rows = await db()
    .select({
      createdAt: contactSubmissions.createdAt,
      email: contactSubmissions.email,
      id: contactSubmissions.id,
      inquiryType: contactSubmissions.inquiryType,
      message: contactSubmissions.message,
      name: contactSubmissions.name,
      subject: contactSubmissions.subject,
    })
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt))
    .limit(ADMIN_LIST_LIMIT);

  return rows.map((row) => ({ ...row, createdAt: toIsoTimestamp(row.createdAt) }));
};

export type AdminSurveyResponse = Awaited<ReturnType<typeof listEventSurveyResponses>>[number];
export type AdminTalkProposal = Awaited<ReturnType<typeof listTalkProposals>>[number];
export type AdminContactSubmission = Awaited<ReturnType<typeof listContactSubmissions>>[number];
