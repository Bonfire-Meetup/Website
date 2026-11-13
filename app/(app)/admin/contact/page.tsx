import type { Metadata } from "next";

import { AdminContactSubmissions } from "@/components/admin/AdminContactSubmissions";
import { buildSimplePageMetadata } from "@/lib/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "admin.meta.contact" });
}

export default function AdminContactSubmissionsPage() {
  return <AdminContactSubmissions />;
}
