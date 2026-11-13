import type { Metadata } from "next";

import { AdminTalkProposals } from "@/components/admin/AdminTalkProposals";
import { buildSimplePageMetadata } from "@/lib/metadata";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "admin.meta.talkProposals" });
}

export default function AdminTalkProposalsPage() {
  return <AdminTalkProposals />;
}
