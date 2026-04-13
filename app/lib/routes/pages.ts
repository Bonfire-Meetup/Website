import {
  createContactUrl,
  createEventReaderUrl,
  createEventSurveyUrl,
  createLoginWithChallengeUrl,
  createLoginWithReasonUrl,
  createMeGuildJoinUrl,
  createMeGuildUrl,
  createNewsletterEditorUrl,
} from "@/lib/routes/app-search-params";

export const LOGIN_REASON = {
  EVENT_RSVP: "event-rsvp",
  SESSION_EXPIRED: "session-expired",
  VIDEO_LOCKED_LIKE: "video-locked-like",
  VIDEO_BOOST: "video-boost",
  WATCH_LATER: "watch-later",
} as const;

export type LoginReason = (typeof LOGIN_REASON)[keyof typeof LOGIN_REASON];

export const PAGE_ROUTES = {
  ANCHOR: {
    EVENTS: "/#events",
    TOP: "/#top",
  },
  CONTACT: "/contact",
  CONTACT_WITH_TYPE: (type: string) => createContactUrl(type),
  CREW: "/crew",
  FAQ: "/faq",
  GUIDES: "/guides",
  GUIDES_ACCOUNT_DELETION: "/guides/account/account-deletion",
  GUIDES_CHECK_IN: "/guides/events/check-in",
  GUIDES_ENGAGEMENT_SIGNALS: "/guides/community/engagement-signals",
  GUIDES_EVENT_RSVP: "/guides/events/event-rsvp",
  GUIDES_GUILD_SUBSCRIPTION: "/guides/account/guild-subscription",
  GUIDES_PROFILE_PRIVACY: "/guides/account/profile-privacy",
  GUIDES_REGISTRATION: "/guides/account/registration",
  GUIDES_SPEAKING: "/guides/community/speaking",
  GUIDES_TICKET_SCANNING: "/guides/crew/ticket-scanning",
  GUILD: "/guild",
  HOME: "/",
  LEGAL: "/legal",
  LIBRARY: "/library",
  LIBRARY_BROWSE: "/library/browse",
  LOGIN: "/login",
  LOGIN_WITH_CHALLENGE: (token: string) => createLoginWithChallengeUrl(token),
  LOGIN_WITH_REASON: (reason: LoginReason) => createLoginWithReasonUrl(reason),
  LOGIN_WITH_CHALLENGE_AND_RETURN: (token: string, returnPath?: string) =>
    createLoginWithChallengeUrl(token, returnPath),
  LOGIN_WITH_REASON_AND_RETURN: (reason: LoginReason, returnPath?: string) =>
    createLoginWithReasonUrl(reason, returnPath),
  ME: "/me",
  ME_GUILD: (options?: Parameters<typeof createMeGuildUrl>[0]) => createMeGuildUrl(options),
  ME_GUILD_JOIN: (options?: Parameters<typeof createMeGuildJoinUrl>[0]) =>
    createMeGuildJoinUrl(options),
  EVENT: (id: string) => `/events/${id}`,
  EVENT_QUESTIONS: (id: string) => `/events/${id}/questions`,
  EVENT_CHECK_IN: "/events/check-ins",
  EVENT_PAST: "/events/past",
  EVENT_READER: "/events/reader",
  EVENT_READER_WITH_EVENT: (eventId: string) => createEventReaderUrl(eventId),
  EVENT_SURVEY: "/events/survey",
  EVENT_SURVEY_WITH_EVENT: (eventId: string) => createEventSurveyUrl(eventId),
  EVENT_UPCOMING: "/events/upcoming",
  PHOTOS: "/photos",
  PHOTOS_ALBUM: (album: string) => `/photos/${album}`,
  PRESS: "/press",
  SUPPORT: "/support",
  SHORT_LINK: (id: string) => `/l/${id}`,
  SPEAK: "/speak",
  THIRD_PARTY: "/third-party",
  TIMELINE: "/timeline",
  USER: (publicId: string) => `/users/${publicId}`,
  WATCH: (slug: string, shortId: string) => `/watch/${slug}-${shortId}`,
  WATCH_LATER: "/me/watch-later",
  NEWSLETTER_ARCHIVE: "/newsletters",
  NEWSLETTER: (slug: string) => `/newsletters/${slug}`,
  NEWSLETTER_EDITOR: "/newsletters/editor/compose",
  NEWSLETTER_EDITOR_WITH_RESEND: (slug: string) => createNewsletterEditorUrl(slug),
} as const;

export const DYNAMIC_ROUTE_PREFIXES = [
  "/watch/",
  "/users/",
  "/events/",
  "/photos/",
  "/me/",
] as const;
