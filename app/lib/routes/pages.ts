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
  CONTACT_WITH_TYPE: (type: string) => `/contact?type=${type}`,
  CREW: "/crew",
  FAQ: "/faq",
  GUIDES: "/guides",
  GUIDES_ACCOUNT_DELETION: "/guides/account-deletion",
  GUIDES_CHECK_IN: "/guides/check-in",
  GUIDES_ENGAGEMENT_SIGNALS: "/guides/engagement-signals",
  GUIDES_EVENT_RSVP: "/guides/event-rsvp",
  GUIDES_PROFILE_PRIVACY: "/guides/profile-privacy",
  GUIDES_REGISTRATION: "/guides/registration",
  GUIDES_SPEAKING: "/guides/speaking",
  GUILD: "/guild",
  HOME: "/",
  LEGAL: "/legal",
  LIBRARY: "/library",
  LIBRARY_BROWSE: "/library/browse",
  LOGIN: "/login",
  LOGIN_WITH_CHALLENGE: (token: string) => `/login?challenge=${token}`,
  LOGIN_WITH_REASON: (reason: LoginReason) => `/login?reason-hint=${reason}`,
  LOGIN_WITH_CHALLENGE_AND_RETURN: (token: string, returnPath?: string) =>
    `/login?challenge=${token}${returnPath ? `&returnPath=${encodeURIComponent(returnPath)}` : ""}`,
  LOGIN_WITH_REASON_AND_RETURN: (reason: LoginReason, returnPath?: string) =>
    `/login?reason-hint=${reason}${returnPath ? `&returnPath=${encodeURIComponent(returnPath)}` : ""}`,
  ME: "/me",
  EVENT: (id: string) => `/events/${id}`,
  EVENT_CHECK_IN: "/events/check-ins",
  EVENT_READER: "/events/reader",
  EVENT_UPCOMING: "/events/upcoming",
  PHOTOS: "/photos",
  PHOTOS_ALBUM: (album: string) => `/photos/${album}`,
  PRESS: "/press",
  SPEAK: "/speak",
  THIRD_PARTY: "/third-party",
  TIMELINE: "/timeline",
  USER: (publicId: string) => `/users/${publicId}`,
  WATCH: (slug: string, shortId: string) => `/watch/${slug}-${shortId}`,
  WATCH_LATER: "/me/watch-later",
  NEWSLETTER_ARCHIVE: "/newsletters",
  NEWSLETTER: (slug: string) => `/newsletters/${slug}`,
  NEWSLETTER_EDITOR: "/newsletters/editor/compose",
} as const;

export const DYNAMIC_ROUTE_PREFIXES = [
  "/watch/",
  "/users/",
  "/events/",
  "/photos/",
  "/me/",
] as const;
