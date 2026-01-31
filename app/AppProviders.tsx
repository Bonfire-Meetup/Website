import { NextIntlClientProvider } from "next-intl";

import { AuthInitializer } from "./components/providers/AuthInitializer";
import { I18nClientSync } from "./components/providers/I18nClientSync";
import { ReduxProvider } from "./components/providers/ReduxProvider";
import { CookieBanner } from "./components/shared/CookieBanner";
import { GlobalPlayerProvider } from "./components/shared/GlobalPlayerProvider";
import { QueryProvider } from "./components/shared/QueryProvider";
import { LocaleSync } from "./components/theme/LocaleSync";
import { MotionManager } from "./components/theme/MotionManager";
import { ThemeProvider } from "./components/theme/ThemeProvider";
import { type Messages } from "./lib/i18n/initial";
import { type Locale } from "./lib/i18n/locales";

interface AppProvidersProps {
  children: React.ReactNode;
  initialLocale: Locale;
  initialMessages: Messages;
}

export function AppProviders({ children, initialLocale, initialMessages }: AppProvidersProps) {
  return (
    <NextIntlClientProvider locale={initialLocale} messages={initialMessages}>
      <I18nClientSync initialLocale={initialLocale} initialMessages={initialMessages}>
        <LocaleSync />
        <ReduxProvider>
          <AuthInitializer />
          <QueryProvider>
            <MotionManager />
            <div className="relative flex min-h-screen flex-col">
              <ThemeProvider>
                <GlobalPlayerProvider>
                  {children}
                  <CookieBanner />
                </GlobalPlayerProvider>
              </ThemeProvider>
            </div>
          </QueryProvider>
        </ReduxProvider>
      </I18nClientSync>
    </NextIntlClientProvider>
  );
}
