export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bonfire:access-token",
  AUTH_CHALLENGE_PREFIX: "bonfire:auth-challenge",
  DRAFT_CONTACT_FORM: "bonfire:draft:contact-form",
  DRAFT_TALK_PROPOSAL: "bonfire:draft:talk-proposal",
  THEME: "bonfire:theme",
} as const;

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
