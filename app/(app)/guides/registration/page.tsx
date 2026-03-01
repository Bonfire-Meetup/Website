import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { RegistrationContent } from "./RegistrationContent";

export default function RegistrationHowToPage() {
  return <RegistrationContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "registrationHowTo" });
}
