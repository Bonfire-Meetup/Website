import { serverEnv } from "@/app/lib/config/env";
import { getEmailFingerprint, logError, logInfo } from "@/app/lib/utils/log";

type EmailAddress = string | string[];

type EmailTag = {
  name: string;
  value: string;
};

export type SendEmailInput = {
  to: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: EmailTag[];
};

type ResendSuccessResponse = {
  id: string;
};

type ResendErrorResponse = {
  message?: string;
  name?: string;
};

const resendEndpoint = "https://api.resend.com/emails";

const getResendApiKey = () => {
  return serverEnv.BNF_RESEND_API_KEY;
};

const getDefaultFrom = () => {
  return serverEnv.BNF_RESEND_FROM;
};

export const getAuthFrom = () => {
  return serverEnv.BNF_RESEND_AUTH_FROM ?? serverEnv.BNF_RESEND_FROM;
};

const validateEmailPayload = (input: SendEmailInput) => {
  if (!input.html && !input.text) {
    throw new Error("Email content is required");
  }
};

export const sendEmail = async (input: SendEmailInput): Promise<ResendSuccessResponse> => {
  validateEmailPayload(input);
  const apiKey = getResendApiKey();
  const from = input.from ?? getDefaultFrom();
  const recipient =
    typeof input.to === "string" ? input.to : input.to.length > 0 ? input.to[0] : null;
  const emailFingerprint = recipient ? getEmailFingerprint(recipient) : null;

  const payload = {
    from,
    to: input.to,
    subject: input.subject,
    html: input.html,
    text: input.text,
    reply_to: input.replyTo,
    cc: input.cc,
    bcc: input.bcc,
    tags: input.tags,
  };

  const body = JSON.stringify(
    Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)),
  );

  const response = await fetch(resendEndpoint, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body,
  });

  const data = (await response.json()) as ResendSuccessResponse | ResendErrorResponse;
  if (!response.ok) {
    const message = "message" in data && data.message ? data.message : "Resend request failed";
    logError("email.send_failed", new Error(message), emailFingerprint ?? undefined);
    throw new Error(message);
  }
  logInfo("email.sent", emailFingerprint ?? undefined);
  return data as ResendSuccessResponse;
};
