import type { Metadata } from "next";

import { buildGuideMetadata, GuidePage } from "@/components/guides/GuidePage";

export default function SpeakerPrepGuidePage() {
  return <GuidePage guide="speakerPrep" />;
}

export function generateMetadata(): Promise<Metadata> {
  return buildGuideMetadata("speakerPrep");
}
