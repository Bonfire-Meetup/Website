import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { CrewPageContent } from "./CrewPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("crew");
}

export default function TeamPage() {
  return <CrewPageContent />;
}
