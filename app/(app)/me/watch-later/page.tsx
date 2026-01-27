import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getRequestLocale } from "@/lib/i18n/request-locale";

import { WatchLaterClient } from "./WatchLaterClient";

export default async function WatchLaterPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <WatchLaterClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getRequestLocale();
  const t = await getTranslations({ locale, namespace: "meta" });
  const tCommon = await getTranslations({ locale, namespace: "common" });
  const commonValues = {
    brandName: tCommon("brandName"),
  };

  return {
    description: t("watchLaterDescription"),
    title: t("watchLaterTitle", commonValues),
  };
}
