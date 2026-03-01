import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { GuidesContent } from "./GuidesContent";

export default function HowToPage() {
  return <GuidesContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "howToPage" });
}
