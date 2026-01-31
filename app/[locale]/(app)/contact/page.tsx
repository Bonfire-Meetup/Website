import type { Metadata } from "next";

import { buildMetaPageMetadata } from "@/lib/metadata";

import { ContactPageContent } from "./ContactPageContent";

export async function generateMetadata(): Promise<Metadata> {
  return buildMetaPageMetadata("contact");
}

export default function ContactPage() {
  return <ContactPageContent />;
}
