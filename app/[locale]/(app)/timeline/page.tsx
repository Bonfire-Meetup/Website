import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { TimelinePageContent } from "./TimelinePageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("timeline");
}

export default function TimelinePage() {
  return <TimelinePageContent />;
}
