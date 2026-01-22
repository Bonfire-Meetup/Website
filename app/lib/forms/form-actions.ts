"use server";

import { headers, cookies } from "next/headers";
import crypto from "crypto";
import { z } from "zod";
import { checkBotId } from "botid/server";
import { insertContactSubmission, insertTalkProposal } from "../data/forms";
import { serverEnv } from "../config/env";

const RATE_LIMIT_WINDOW_MS = 3600_000;
const RATE_LIMIT_MAX_CONTACT = 5;
const RATE_LIMIT_MAX_TALK = 3;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";
const CSRF_COOKIE_NAME = "bnf_csrf";

const rateLimitStore = new Map<string, number[]>();

const hashValue = (value: string) => {
  const salt = serverEnv.BNF_HEARTS_SALT;
  return crypto.createHash("sha256").update(`${value}:${salt}`).digest("hex");
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
  name: z.string().min(2, "nameRequired").max(100),
  email: z.string().email("emailInvalid").max(255),
  subject: z.string().min(3, "subjectRequired").max(200),
  message: z.string().min(10, "messageRequired").max(5000),
  inquiryType: z.enum(["general", "press", "crew", "coc"]).optional(),
});

const talkProposalSchema = z.object({
  speakerName: z.string().min(2, "nameRequired").max(100),
  email: z.string().email("emailInvalid").max(255),
  talkTitle: z.string().min(5, "titleRequired").max(200),
  abstract: z.string().min(50, "abstractRequired").max(5000),
  duration: z.enum(["15", "30", "45"], { message: "durationRequired" }),
  experience: z.string().max(2000).optional(),
  preferredLocation: z.enum(["prague", "zlin", "either"]).optional(),
});

export type ContactFormState = {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
};

export type TalkProposalFormState = {
  success: boolean;
  errors?: Record<string, string>;
  message?: string;
};

const verifyTurnstile = async (token: FormDataEntryValue | null) => {
  const secret = serverEnv.BNF_TURNSTILE_SECRET_KEY;
  if (!token || typeof token !== "string") return false;

  try {
    const response = await fetch(TURNSTILE_VERIFY_URL, {
      method: "POST",
      body: new URLSearchParams({
        secret,
        response: token,
      }),
      cache: "no-store",
    });

    if (!response.ok) return false;
    const data = (await response.json()) as { success?: boolean };
    return Boolean(data.success);
  } catch (error) {
    console.error("Turnstile verification error:", error);
    return false;
  }
};

const verifyCsrfToken = async (token: FormDataEntryValue | null) => {
  if (!token || typeof token !== "string") return false;
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
    return { success: false, message: "botBlocked" };
  }

  const ipHash = await getClientIpHash();

  if (isRateLimited(`contact:${ipHash}`, RATE_LIMIT_MAX_CONTACT)) {
    return { success: false, message: "rateLimited" };
  }

  if (!(await verifyCsrfToken(formData.get("csrfToken")))) {
    return { success: false, message: "csrfInvalid" };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    return { success: false, message: "captchaFailed" };
  }

  const rawData = {
    name: formData.get("name"),
    email: formData.get("email"),
    subject: formData.get("subject"),
    message: formData.get("message"),
    inquiryType: formData.get("inquiryType") || undefined,
  };

  const result = contactSchema.safeParse(rawData);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const { name, email, subject, message, inquiryType } = result.data;
    await insertContactSubmission({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      inquiryType: inquiryType || "general",
      subject: subject.trim(),
      message: message.trim(),
      ipHash,
    });

    return { success: true };
  } catch (error) {
    console.error("Contact form error:", error);
    return { success: false, message: "generic" };
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
    return { success: false, message: "botBlocked" };
  }

  const ipHash = await getClientIpHash();

  if (isRateLimited(`talk:${ipHash}`, RATE_LIMIT_MAX_TALK)) {
    return { success: false, message: "rateLimited" };
  }

  if (!(await verifyCsrfToken(formData.get("csrfToken")))) {
    return { success: false, message: "csrfInvalid" };
  }

  if (!(await verifyTurnstile(formData.get("cf-turnstile-response")))) {
    return { success: false, message: "captchaFailed" };
  }

  const rawData = {
    speakerName: formData.get("speakerName"),
    email: formData.get("email"),
    talkTitle: formData.get("talkTitle"),
    abstract: formData.get("abstract"),
    duration: formData.get("duration"),
    experience: formData.get("experience") || undefined,
    preferredLocation: formData.get("preferredLocation") || undefined,
  };

  const result = talkProposalSchema.safeParse(rawData);

  if (!result.success) {
    const errors: Record<string, string> = {};
    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    }
    return { success: false, errors };
  }

  try {
    const { speakerName, email, talkTitle, abstract, duration, experience, preferredLocation } =
      result.data;
    await insertTalkProposal({
      speakerName: speakerName.trim(),
      email: email.trim().toLowerCase(),
      talkTitle: talkTitle.trim(),
      abstract: abstract.trim(),
      duration,
      experience: experience?.trim() || null,
      preferredLocation: preferredLocation || "either",
      ipHash,
    });

    return { success: true };
  } catch (error) {
    console.error("Talk proposal error:", error);
    return { success: false, message: "generic" };
  }
}
