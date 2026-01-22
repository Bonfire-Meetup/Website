export const STORAGE_KEYS = {
  ACCESS_TOKEN: "bonfire:access-token",
  THEME: "bonfire:theme",
  DRAFT_TALK_PROPOSAL: "bonfire:draft:talk-proposal",
  DRAFT_CONTACT_FORM: "bonfire:draft:contact-form",
  AUTH_CHALLENGE_PREFIX: "bonfire:auth-challenge",
} as const;

export const getAuthChallengeKey = (token: string): string =>
  `${STORAGE_KEYS.AUTH_CHALLENGE_PREFIX}:${token}`;
