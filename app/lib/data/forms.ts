import { db } from "@/lib/data/db";
import { contactSubmissions, talkProposals } from "@/lib/data/schema";
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
