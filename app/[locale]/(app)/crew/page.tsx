import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CrewPageContent } from "./CrewPageContent";

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
