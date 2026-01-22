import { serverEnv } from "@/lib/config/env";
import { getEmailFingerprint, logError, logInfo } from "@/lib/utils/log";

type EmailAddress = string | string[];

interface EmailTag {
  name: string;
  value: string;
}

export interface SendEmailInput {
  to: EmailAddress;
  subject: string;
  html?: string;
  text?: string;
  from?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
  tags?: EmailTag[];
}

interface ResendSuccessResponse {
  id: string;
}

interface ResendErrorResponse {
  message?: string;
  name?: string;
}

const resendEndpoint = "https://api.resend.com/emails";

const getResendApiKey = () => serverEnv.BNF_RESEND_API_KEY;

const getDefaultFrom = () => serverEnv.BNF_RESEND_FROM;

const AUTH_EMAIL_DISPLAY_NAME = "Bonfire Events Auth";

export const getAuthFrom = () => {
  const email = serverEnv.BNF_RESEND_AUTH_FROM ?? serverEnv.BNF_RESEND_FROM;
  return `${AUTH_EMAIL_DISPLAY_NAME} <${email}>`;
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
    bcc: input.bcc,
    cc: input.cc,
    from,
    html: input.html,
    reply_to: input.replyTo,
    subject: input.subject,
    tags: input.tags,
    text: input.text,
    to: input.to,
  };

  const body = JSON.stringify(
    Object.fromEntries(Object.entries(payload).filter(([, value]) => value !== undefined)),
  );

  const response = await fetch(resendEndpoint, {
    body,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
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
