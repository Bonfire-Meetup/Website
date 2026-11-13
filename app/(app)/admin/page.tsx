import { redirect } from "next/navigation";

import { PAGE_ROUTES } from "@/lib/routes/pages";

export default function AdminPage() {
  redirect(PAGE_ROUTES.ADMIN_SURVEY_RESPONSES);
}
