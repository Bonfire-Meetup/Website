import type { Metadata } from "next";

import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { LegalPageContent } from "./LegalPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "legal" });
}

export default function LegalPage() {
  return <LegalPageContent />;
}
