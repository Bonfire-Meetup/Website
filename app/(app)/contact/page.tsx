import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";

import { ContactPageContent } from "./ContactPageContent";

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
    description: t("contactDescription", commonValues),
    openGraph: {
      description: t("contactDescription", commonValues),
      title: t("contactTitle", commonValues),
      type: "website",
    },
    title: t("contactTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("contactDescription", commonValues),
      title: t("contactTitle", commonValues),
    },
  };
}

export default function ContactPage() {
  return <ContactPageContent />;
}
