import type { Metadata } from "next";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";

import { AppProviders } from "@/AppProviders";
import { RouteComplete } from "@/components/navigation/RouteComplete";
import { type Messages } from "@/lib/i18n/initial";
import { type Locale, LOCALES_ARRAY, isValidLocale } from "@/lib/i18n/locales";

export function generateStaticParams() {
  return LOCALES_ARRAY.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = isValidLocale(resolvedParams.locale) ? resolvedParams.locale : LOCALES_ARRAY[0];
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };
  const keywords = t.raw("keywords") as string[];
  const processedKeywords = keywords.map((k) =>
    k === "{prague}"
      ? commonValues.prague
      : k === "{zlin}"
        ? commonValues.zlin
        : k === "{country}"
          ? commonValues.country
          : k,
  );

  return {
    authors: [{ name: t("author", commonValues) }],
    description: t("siteDescription", commonValues),
    keywords: processedKeywords,
    openGraph: {
      description: t("siteDescription", commonValues),
      siteName: t("siteName", commonValues),
      title: t("siteTitle", commonValues),
      type: "website",
    },
    robots: {
      follow: true,
      index: true,
    },
    title: t("siteTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("siteDescription", commonValues),
      title: t("siteTitle", commonValues),
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;

  if (!isValidLocale(resolvedParams.locale)) {
    notFound();
  }

  const locale = resolvedParams.locale as Locale;
  const messages = (await getMessages({ locale })) as Messages;

  return (
    <AppProviders initialLocale={locale} initialMessages={messages}>
      <RouteComplete />
      {children}
    </AppProviders>
  );
}
