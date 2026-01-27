import { NextIntlClientProvider } from "next-intl";

import { AuthInitializer } from "./components/providers/AuthInitializer";
import { ReduxProvider } from "./components/providers/ReduxProvider";
import { GlobalPlayerProvider } from "./components/shared/GlobalPlayerProvider";
import { QueryProvider } from "./components/shared/QueryProvider";
import { LocaleSync } from "./components/theme/LocaleSync";
import { MotionManager } from "./components/theme/MotionManager";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { getRequestLocale } from "./lib/i18n/request-locale";

export async function AppProviders({ children }: { children: React.ReactNode }) {
  const locale = await getRequestLocale();
  const messages = (await import(`./locales/${locale}.json`)).default;

  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      <LocaleSync />
      <ReduxProvider>
        <AuthInitializer />
        <QueryProvider>
          <MotionManager />
          <div className="relative flex min-h-screen flex-col">
            <ThemeProvider>
              <GlobalPlayerProvider>{children}</GlobalPlayerProvider>
            </ThemeProvider>
          </div>
        </QueryProvider>
      </ReduxProvider>
    </NextIntlClientProvider>
  );
}
