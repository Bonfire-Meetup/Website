import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { TimelinePageContent } from "./TimelinePageContent";

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
    description: t("timelineDescription"),
    openGraph: {
      description: t("timelineDescription"),
      title: t("timelineTitle", commonValues),
      type: "website",
    },
    title: t("timelineTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("timelineDescription"),
      title: t("timelineTitle", commonValues),
    },
  };
}

export default function TimelinePage() {
  return <TimelinePageContent />;
}
