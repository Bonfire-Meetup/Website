import { getRequestConfig } from "next-intl/server";

import { getInitialLocale, getInitialMessages } from "../app/lib/i18n/initial";

export default getRequestConfig(async () => {
  const locale = await getInitialLocale();
  return {
    locale,
    messages: await getInitialMessages(locale),
  };
});
