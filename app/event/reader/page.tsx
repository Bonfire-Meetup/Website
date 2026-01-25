import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

import { Footer } from "@/components/layout/Footer";
import { Header } from "@/components/layout/Header";

import { ReaderClient } from "./ReaderClient";

export default async function ReaderPage() {
  return (
    <>
      <Header />
      <main className="gradient-bg-static min-h-screen px-2 pt-24 pb-16 sm:px-4 sm:pt-32 sm:pb-20">
        <div className="mx-auto max-w-4xl">
          <ReaderClient />
        </div>
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("reader");
  const tCommon = await getTranslations("common");

  return {
    title: t("title", { brandName: tCommon("brandName") }),
    description: t("description"),
  };
}
