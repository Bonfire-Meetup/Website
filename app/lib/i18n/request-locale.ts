import { getLocale } from "next-intl/server";
import { cache } from "react";

import { type Locale } from "./locales";

export const getRequestLocale = cache(async (): Promise<Locale> => (await getLocale()) as Locale);
