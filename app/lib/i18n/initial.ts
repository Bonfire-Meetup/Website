import { DEFAULT_LOCALE, type Locale } from "./locales";
import { loadMessages, type Messages } from "./messages";

export type { Messages } from "./messages";

export const getInitialLocale = (): Locale => DEFAULT_LOCALE;

export const getInitialMessages = (locale: Locale): Promise<Messages> => loadMessages(locale);
