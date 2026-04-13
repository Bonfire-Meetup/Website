import type { LoginReason } from "@/lib/routes/pages";

export function createContactUrl(type: string): string {
  const params = new URLSearchParams({ type });
  return `/contact?${params.toString()}`;
}

export function createLoginWithChallengeUrl(token: string, returnPath?: string): string {
  const params = new URLSearchParams({ challenge: token });
  if (returnPath) {
    params.set("returnPath", returnPath);
  }
  return `/login?${params.toString()}`;
}

export function createLoginWithReasonUrl(reason: LoginReason, returnPath?: string): string {
  const params = new URLSearchParams({ "reason-hint": reason });
  if (returnPath) {
    params.set("returnPath", returnPath);
  }
  return `/login?${params.toString()}`;
}

export function createNewsletterEditorUrl(resend?: string): string {
  if (!resend) {
    return "/newsletters/editor/compose";
  }

  const params = new URLSearchParams({ resend });
  return `/newsletters/editor/compose?${params.toString()}`;
}

export function createEventSurveyUrl(eventId?: string): string {
  if (!eventId) {
    return "/events/survey";
  }

  const params = new URLSearchParams({ eventId });
  return `/events/survey?${params.toString()}`;
}

export function createEventReaderUrl(eventId?: string): string {
  if (!eventId) {
    return "/events/reader";
  }

  const params = new URLSearchParams({ eventId });
  return `/events/reader?${params.toString()}`;
}

export function createMeGuildUrl(options?: { checkout?: "success" | "canceled" }) {
  if (!options?.checkout) {
    return "/me";
  }

  const params = new URLSearchParams({ "checkout-state": options.checkout });
  return `/me?${params.toString()}`;
}

export function createMeGuildJoinUrl(options?: { tier?: 1 | 2 | 3; checkout?: "canceled" }) {
  const params = new URLSearchParams();

  if (options?.tier) {
    params.set("tier", String(options.tier));
  }

  if (options?.checkout) {
    params.set("checkout-state", options.checkout);
  }

  if (params.size === 0) {
    return "/me/guild";
  }

  return `/me/guild?${params.toString()}`;
}
