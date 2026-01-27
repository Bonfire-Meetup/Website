import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { DEFAULT_LOCALE } from "@/lib/i18n/locales";

import { ReaderClient } from "./ReaderClient";

export default async function ReaderPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
      <div className="mx-auto max-w-4xl">
        <ReaderClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "reader" });
  const tCommon = await getTranslations({ locale: DEFAULT_LOCALE, namespace: "common" });

  return {
    title: t("title", { brandName: tCommon("brandName") }),
    description: t("description"),
  };
}
