import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { PressPageContent } from "./PressPageContent";

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
    description: t("pressDescription", commonValues),
    openGraph: {
      description: t("pressDescription", commonValues),
      title: t("pressTitle", commonValues),
      type: "website",
    },
    title: t("pressTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("pressDescription", commonValues),
      title: t("pressTitle", commonValues),
    },
  };
}

export default function PressPage() {
  return <PressPageContent />;
}
