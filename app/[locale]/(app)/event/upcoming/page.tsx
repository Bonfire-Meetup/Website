import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { UpcomingEventsPageContent } from "./UpcomingEventsPageContent";

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
    description: t("upcomingEventsDescription", commonValues),
    openGraph: {
      description: t("upcomingEventsDescription", commonValues),
      title: t("upcomingEventsTitle", commonValues),
      type: "website",
    },
    title: t("upcomingEventsTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("upcomingEventsDescription", commonValues),
      title: t("upcomingEventsTitle", commonValues),
    },
  };
}

export default function UpcomingEventsPage() {
  return <UpcomingEventsPageContent />;
}
