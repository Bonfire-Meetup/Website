"use server";

import crypto from "crypto";

import { checkBotId } from "botid/server";
import { cookies, headers } from "next/headers";
import { z } from "zod";

import { serverEnv } from "../config/env";
import { insertContactSubmission, insertTalkProposal } from "../data/forms";
import { logError, logInfo, logWarn } from "../utils/log";

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
    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    }

    return { errors, success: false };
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
    const errors: Record<string, string> = {};

    for (const issue of result.error.issues) {
      const field = issue.path[0] as string;
      errors[field] = issue.message;
    }

    return { errors, success: false };
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
