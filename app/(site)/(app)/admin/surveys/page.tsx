import type { Metadata } from "next";

import { AdminSurveyResponses } from "@/components/admin/AdminSurveyResponses";
import { buildSimplePageMetadata } from "@/lib/metadata";

export const instant = false;

export async function generateMetadata(): Promise<Metadata> {
  return buildSimplePageMetadata({ ns: "admin.meta.surveys" });
}

export default function AdminSurveyResponsesPage() {
  return <AdminSurveyResponses />;
}
