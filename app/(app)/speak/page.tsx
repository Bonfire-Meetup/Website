import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { SpeakPageContent } from "./SpeakPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("talkProposal");
}

export default function TalkProposalPage() {
  return <SpeakPageContent />;
}
