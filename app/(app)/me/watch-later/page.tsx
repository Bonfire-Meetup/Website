import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

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
  const t = await getTranslations("meta");
  const tCommon = await getTranslations("common");
  const commonValues = {
    brandName: tCommon("brandName"),
  };

  return {
    description: t("watchLaterDescription"),
    title: t("watchLaterTitle", commonValues),
  };
}
