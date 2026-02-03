import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { FaqPageContent } from "./FaqPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("faq");
}

export default function FaqPage() {
  return <FaqPageContent />;
}
