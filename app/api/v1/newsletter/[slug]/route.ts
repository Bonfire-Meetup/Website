import { NextResponse } from "next/server";

import { withRequestContext, withRole } from "@/lib/api/route-wrappers";
import { USER_ROLES } from "@/lib/config/roles";
import { deleteNewsletterBySlug } from "@/lib/data/newsletter-archive";
import { logError, logInfo } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ slug: string }>;
}

export const DELETE = withRequestContext(
  withRole<RouteParams>(
    "newsletter.delete",
    USER_ROLES.EDITOR,
  )(async (_request: Request, { params, auth }) => {
    const { slug } = await params;

    try {
      const deleted = await deleteNewsletterBySlug(slug);

      if (!deleted) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      logInfo("newsletter.delete.success", { slug, deletedBy: auth.userId });

      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("newsletter.delete.error", error, { slug, userId: auth.userId });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
