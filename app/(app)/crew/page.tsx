import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";

import { CrewPageContent } from "./CrewPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("crewDescription", commonValues),
    openGraph: {
      description: t("crewDescription", commonValues),
      title: t("crewTitle", commonValues),
      type: "website",
    },
    title: t("crewTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("crewDescription", commonValues),
      title: t("crewTitle", commonValues),
    },
  };
}

export default function TeamPage() {
  return <CrewPageContent />;
}
