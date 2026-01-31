export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bonfire:access-token",
  AUTH_CHALLENGE_PREFIX: "bonfire:auth-challenge",
  DRAFT_CONTACT_FORM: "bonfire:draft:contact-form",
  DRAFT_TALK_PROPOSAL: "bonfire:draft:talk-proposal",
  THEME: "bonfire:theme",
} as const;

export const COOKIE_KEYS = {
  CONSENT: "bonfire_consent",
} as const;

export function setCookie(name: string, value: string, days = 365): void {
  if (typeof document === "undefined") {
    return;
  }
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)};expires=${expires};path=/;SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  if (typeof document === "undefined") {
    return null;
  }
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match ? decodeURIComponent(match[2]) : null;
}

export const getAuthChallengeKey = (token: string): string =>
  `${STORAGE_KEYS.AUTH_CHALLENGE_PREFIX}:${token}`;

export const clearAllAuthChallenges = (): void => {
  if (typeof window === "undefined") {
    return;
  }

  const keysToRemove: string[] = [];

  for (let i = 0; i < window.localStorage.length; i++) {
    const key = window.localStorage.key(i);
    if (key?.startsWith(STORAGE_KEYS.AUTH_CHALLENGE_PREFIX)) {
      keysToRemove.push(key);
    }
  }

  keysToRemove.forEach((key) => window.localStorage.removeItem(key));
};
