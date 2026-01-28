import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { getInitialLocale } from "@/lib/i18n/initial";

import { CheckInClient } from "./CheckInClient";

export default function CheckInPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <CheckInClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getInitialLocale();
  const t = await getTranslations({ locale, namespace: "checkIn" });
  const tCommon = await getTranslations({ locale, namespace: "common" });

  return {
    title: t("title", { brandName: tCommon("brandName") }),
    description: t("description"),
  };
}
