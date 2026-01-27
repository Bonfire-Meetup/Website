import { Suspense } from "react";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";
import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

import { AppProviders } from "../AppProviders";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <AppProviders locale={DEFAULT_LOCALE}>
        <Header locale={DEFAULT_LOCALE} />
        {children}
        <Footer locale={DEFAULT_LOCALE} />
      </AppProviders>
    </Suspense>
  );
}
