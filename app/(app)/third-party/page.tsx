import type { Metadata } from "next";

import { buildTitleSubtitleMetadata } from "@/lib/metadata";

import { ThirdPartyPageContent } from "./ThirdPartyPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildTitleSubtitleMetadata({ ns: "attributions" });
}

export default function ThirdPartyPage() {
  return <ThirdPartyPageContent />;
}
