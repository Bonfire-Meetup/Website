import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { LegalPageContent } from "./LegalPageContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("legal");

  return {
    description: t("subtitle"),
    title: t("title"),
  };
}

export default function LegalPage() {
  return <LegalPageContent />;
}
