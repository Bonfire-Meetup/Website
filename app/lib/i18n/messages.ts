import enBaseMessages from "@/locales/en.json";
import enGuideMessages from "@/locales/guides/en.json";

import { DEFAULT_LOCALE, type Locale } from "./locales";

const mergeMessages = <
  TBase extends Record<string, unknown>,
  TGuide extends Record<string, unknown>,
>(
  base: TBase,
  guides: TGuide,
) => ({ ...base, ...guides });

const enMessages = mergeMessages(enBaseMessages, enGuideMessages);

export type Messages = typeof enMessages;

export async function loadMessages(locale: Locale): Promise<Messages> {
  if (locale === DEFAULT_LOCALE) {
    return enMessages;
  }

  const [baseMod, guideMod] = await Promise.all([
    import(`@/locales/${locale}.json`),
    import(`@/locales/guides/${locale}.json`),
  ]);

  return mergeMessages(
    baseMod.default as Record<string, unknown>,
    guideMod.default as Record<string, unknown>,
  ) as Messages;
}
