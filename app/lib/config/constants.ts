export const LOCATIONS = {
  PRAGUE: "Prague",
  ZLIN: "Zlin",
} as const;

export type LocationValue = (typeof LOCATIONS)[keyof typeof LOCATIONS];

export const WEBSITE_URLS = {
  BASE: "https://www.bnf.events",
  CDN: "https://cdn-img.bnf.events",
  CONTACT_EMAIL: "hello@bnf.events",
  CONTACT_EMAIL_COC: "hello+coc@bnf.events",
  CONTACT_EMAIL_CREW: "hello+crew@bnf.events",
  CONTACT_EMAIL_PRESS: "hello+press@bnf.events",
  CONTACT_EMAIL_PROPOSAL: "hello+proposal@bnf.events",
} as const;

export const BOOST_CONFIG = {
  BOOSTS_PER_MONTH: 2,
  MAX_BOOSTS: 6,
} as const;

export const DEFAULT_TIMEZONE = "Europe/Prague";
