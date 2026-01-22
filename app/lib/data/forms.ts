import { getDatabaseClient } from "@/app/lib/db";

type ContactSubmission = {
  name: string;
  email: string;
  inquiryType: string;
  subject: string;
  message: string;
  ipHash: string;
};

type TalkProposalSubmission = {
  speakerName: string;
  email: string;
  talkTitle: string;
  abstract: string;
  duration: string;
  experience: string | null;
  preferredLocation: string;
  ipHash: string;
};

export const insertContactSubmission = async ({
  name,
  email,
  inquiryType,
  subject,
  message,
  ipHash,
}: ContactSubmission) => {
  const sql = getDatabaseClient();
  await sql`
    INSERT INTO contact_submissions (name, email, inquiry_type, subject, message, ip_hash)
    VALUES (
      ${name},
      ${email},
      ${inquiryType},
      ${subject},
      ${message},
      ${ipHash}
    )
  `;
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
  const sql = getDatabaseClient();
  await sql`
    INSERT INTO talk_proposals (speaker_name, email, talk_title, abstract, duration, experience, preferred_location, ip_hash)
    VALUES (
      ${speakerName},
      ${email},
      ${talkTitle},
      ${abstract},
      ${duration},
      ${experience},
      ${preferredLocation},
      ${ipHash}
    )
  `;
};
