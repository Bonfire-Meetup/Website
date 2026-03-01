import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { SpeakingContent } from "./SpeakingContent";

export default function SpeakingGuidePage() {
  return <SpeakingContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "speakingGuide" });
}
