import "server-only";

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
