import type { Metadata } from "next";

import { getGuideCards } from "@/content/guides";
import { buildSimplePageMetadata } from "@/lib/metadata";

import { GuidesContent } from "./GuidesContent";

export default function GuidesPage() {
  return <GuidesContent cards={getGuideCards()} />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "guidesPage" });
}
