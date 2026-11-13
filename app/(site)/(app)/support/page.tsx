import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { HelpPageContent } from "../help/HelpPageContent";

export default function SupportPage() {
  return <HelpPageContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "helpPage" });
}
