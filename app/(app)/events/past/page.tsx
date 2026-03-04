import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { PastEventsPageContent } from "./PastEventsPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("pastEvents");
}

export default function PastEventsPage() {
  return <PastEventsPageContent />;
}
