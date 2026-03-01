import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { AccountDeletionContent } from "./AccountDeletionContent";

export default function AccountDeletionGuidePage() {
  return <AccountDeletionContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "accountDeletionGuide" });
}
