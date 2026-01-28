import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { SpeakPageContent } from "./SpeakPageContent";

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
    description: t("talkProposalDescription", commonValues),
    openGraph: {
      description: t("talkProposalDescription", commonValues),
      title: t("talkProposalTitle", commonValues),
      type: "website",
    },
    title: t("talkProposalTitle", commonValues),
    twitter: {
      card: "summary_large_image",
      description: t("talkProposalDescription", commonValues),
      title: t("talkProposalTitle", commonValues),
    },
  };
}

export default function TalkProposalPage() {
  return <SpeakPageContent />;
}
