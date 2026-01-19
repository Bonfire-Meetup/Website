import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { Header } from "../components/Header";
import { Footer } from "../components/Footer";
import { RecordingsCatalog } from "../components/RecordingsCatalog";
import { getAllRecordings } from "../lib/recordings";

export default function RecordingsPage() {
  const t = useTranslations("recordingsPage");
  const recordings = getAllRecordings();

  return (
    <>
      <Header />
      <main className="gradient-bg min-h-screen pt-24">
        <RecordingsCatalog recordings={recordings} title={t("title")} subtitle={t("subtitle")} />
      </main>
      <Footer />
    </>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("recordingsTitle"),
    description: t("recordingsDescription"),
    openGraph: {
      title: t("recordingsTitle"),
      description: t("recordingsDescription"),
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: t("recordingsTitle"),
      description: t("recordingsDescription"),
    },
  };
}
