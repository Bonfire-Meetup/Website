import type { Metadata } from "next";

import { buildSimplePageMetadata } from "@/lib/metadata";

import { ProfilePrivacyContent } from "./ProfilePrivacyContent";

export default function ProfilePrivacyGuidePage() {
  return <ProfilePrivacyContent />;
}

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "profilePrivacyGuide" });
}
