import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { FaqPageContent } from "./FaqPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
    country: tCommon("country"),
    prague: tCommon("prague"),
    zlin: tCommon("zlin"),
  };

  return {
    description: t("faqDescription", commonValues),
    openGraph: {
      description: t("faqDescription", commonValues),
      title: t("faqTitle", commonValues),
      type: "website",
    },
    title: t("faqTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("faqDescription", commonValues),
      title: t("faqTitle", commonValues),
    },
  };
}

export default function FaqPage() {
  return <FaqPageContent />;
}
