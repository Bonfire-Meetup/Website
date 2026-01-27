import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { HomeContent } from "@/HomeContent";
import { getRequestLocale } from "@/lib/i18n/request-locale";
import { getHeroImages } from "@/lib/recordings/data";

export default async function HomePage() {
  const locale = await getRequestLocale();
  const heroImages = await getHeroImages("");

  return <HomeContent heroImages={heroImages} locale={locale} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("homeDescription", commonValues),
    openGraph: {
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
      type: "website",
    },
    title: t("homeTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("homeDescription", commonValues),
      title: t("homeTitle", commonValues),
    },
  };
}
