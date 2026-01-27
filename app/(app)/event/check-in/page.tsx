import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { CheckInClient } from "./CheckInClient";

export default async function CheckInPage() {
  return (
    <main className="gradient-bg-static min-h-screen px-4 pt-32 pb-20">
      <div className="mx-auto max-w-6xl">
        <CheckInClient />
      </div>
    </main>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("checkIn");
  const tCommon = await getTranslations("common");

  return {
    title: t("title", { brandName: tCommon("brandName") }),
    description: t("description"),
  };
}
