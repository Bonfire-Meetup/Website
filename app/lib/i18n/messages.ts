import enAccountMessages from "@/locales/account/en.json";
import enAttributionsMessages from "@/locales/attributions/en.json";
import enAuthLoginMessages from "@/locales/authLogin/en.json";
import enCheckInMessages from "@/locales/checkIn/en.json";
import enCommonMessages from "@/locales/common/en.json";
import enContactPageMessages from "@/locales/contactPage/en.json";
import enCookieConsentMessages from "@/locales/cookieConsent/en.json";
import enEmailMessages from "@/locales/email/en.json";
import enRootMessages from "@/locales/en.json";
import enErrorMessages from "@/locales/error/en.json";
import enEventsMessages from "@/locales/events/en.json";
import enEventsSurveyPageMessages from "@/locales/eventsSurveyPage/en.json";
import enFaqPageMessages from "@/locales/faqPage/en.json";
import enFooterMessages from "@/locales/footer/en.json";
import enGuideMessages from "@/locales/guides/en.json";
import enGuildPageMessages from "@/locales/guildPage/en.json";
import enHeaderMessages from "@/locales/header/en.json";
import enHelpPageMessages from "@/locales/helpPage/en.json";
import enHeroMessages from "@/locales/hero/en.json";
import enLanguageMessages from "@/locales/language/en.json";
import enLegalMessages from "@/locales/legal/en.json";
import enLibraryPageMessages from "@/locales/libraryPage/en.json";
import enMetaMessages from "@/locales/meta/en.json";
import enNewsletterEditorMessages from "@/locales/newsletterEditor/en.json";
import enPhotosMessages from "@/locales/photos/en.json";
import enPressMessages from "@/locales/press/en.json";
import enReaderMessages from "@/locales/reader/en.json";
import enRecordingsMessages from "@/locales/recordings/en.json";
import enSectionsMessages from "@/locales/sections/en.json";
import enTalkProposalPageMessages from "@/locales/talkProposalPage/en.json";
import enTeamPageMessages from "@/locales/teamPage/en.json";
import enTimelineMessages from "@/locales/timeline/en.json";
import enWatchLaterPageMessages from "@/locales/watchLaterPage/en.json";

import { DEFAULT_LOCALE, type Locale } from "./locales";

const moduleLoaders = [
  (locale: Locale) => import(`@/locales/account/${locale}.json`),
  (locale: Locale) => import(`@/locales/attributions/${locale}.json`),
  (locale: Locale) => import(`@/locales/authLogin/${locale}.json`),
  (locale: Locale) => import(`@/locales/checkIn/${locale}.json`),
  (locale: Locale) => import(`@/locales/common/${locale}.json`),
  (locale: Locale) => import(`@/locales/contactPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/cookieConsent/${locale}.json`),
  (locale: Locale) => import(`@/locales/email/${locale}.json`),
  (locale: Locale) => import(`@/locales/error/${locale}.json`),
  (locale: Locale) => import(`@/locales/events/${locale}.json`),
  (locale: Locale) => import(`@/locales/eventsSurveyPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/faqPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/footer/${locale}.json`),
  (locale: Locale) => import(`@/locales/helpPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/guides/${locale}.json`),
  (locale: Locale) => import(`@/locales/guildPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/header/${locale}.json`),
  (locale: Locale) => import(`@/locales/hero/${locale}.json`),
  (locale: Locale) => import(`@/locales/language/${locale}.json`),
  (locale: Locale) => import(`@/locales/legal/${locale}.json`),
  (locale: Locale) => import(`@/locales/libraryPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/meta/${locale}.json`),
  (locale: Locale) => import(`@/locales/newsletterEditor/${locale}.json`),
  (locale: Locale) => import(`@/locales/photos/${locale}.json`),
  (locale: Locale) => import(`@/locales/press/${locale}.json`),
  (locale: Locale) => import(`@/locales/reader/${locale}.json`),
  (locale: Locale) => import(`@/locales/recordings/${locale}.json`),
  (locale: Locale) => import(`@/locales/sections/${locale}.json`),
  (locale: Locale) => import(`@/locales/talkProposalPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/teamPage/${locale}.json`),
  (locale: Locale) => import(`@/locales/timeline/${locale}.json`),
  (locale: Locale) => import(`@/locales/watchLaterPage/${locale}.json`),
] as const;

const mergeMessages = (...chunks: Record<string, unknown>[]) =>
  chunks.reduce<Record<string, unknown>>((acc, chunk) => ({ ...acc, ...chunk }), {});

const enMessages = mergeMessages(
  enRootMessages,
  enAccountMessages,
  enAttributionsMessages,
  enAuthLoginMessages,
  enCheckInMessages,
  enCommonMessages,
  enContactPageMessages,
  enCookieConsentMessages,
  enEmailMessages,
  enErrorMessages,
  enEventsMessages,
  enEventsSurveyPageMessages,
  enFaqPageMessages,
  enFooterMessages,
  enHelpPageMessages,
  enGuideMessages,
  enGuildPageMessages,
  enHeaderMessages,
  enHeroMessages,
  enLanguageMessages,
  enLegalMessages,
  enLibraryPageMessages,
  enMetaMessages,
  enNewsletterEditorMessages,
  enPhotosMessages,
  enPressMessages,
  enReaderMessages,
  enRecordingsMessages,
  enSectionsMessages,
  enTalkProposalPageMessages,
  enTeamPageMessages,
  enTimelineMessages,
  enWatchLaterPageMessages,
);

const localeCache = new Map<Locale, Messages>([[DEFAULT_LOCALE, enMessages]]);

export type Messages = typeof enMessages;

export async function loadMessages(locale: Locale): Promise<Messages> {
  const cached = localeCache.get(locale);
  if (cached) {
    return cached;
  }

  const [rootMod, ...moduleMods] = await Promise.all([
    import(`@/locales/${locale}.json`),
    ...moduleLoaders.map((load) => load(locale)),
  ]);

  const merged = mergeMessages(
    rootMod.default as Record<string, unknown>,
    ...moduleMods.map((mod) => mod.default as Record<string, unknown>),
  ) as Messages;

  localeCache.set(locale, merged);
  return merged;
}
