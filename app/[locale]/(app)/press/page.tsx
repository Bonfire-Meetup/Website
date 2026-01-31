import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { PressPageContent } from "./PressPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("press");
}

export default function PressPage() {
  return <PressPageContent />;
}
