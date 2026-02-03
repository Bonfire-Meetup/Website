import { NextResponse } from "next/server";
import { z } from "zod";

import { withAuth, withRequestContext } from "@/lib/api/route-wrappers";
import {
  deletePasskey,
  getPasskeyById,
  getPasskeyCountByUserId,
  updatePasskeyName,
} from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().max(100).nullable(),
});

export const PATCH = withRequestContext(
  withAuth<RouteParams>("passkey.update")(async (request: Request, { params, auth }) => {
    const { userId } = auth;
    const { id } = await params;

    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    const result = updateSchema.safeParse(payload);

    if (!result.success) {
      return NextResponse.json({ error: "invalid_request" }, { status: 400 });
    }

    try {
      const passkey = await getPasskeyById(id);

      if (!passkey || passkey.userId !== userId) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      await updatePasskeyName(id, userId, result.data.name);

      logInfo("passkey.update.success", { userId, passkeyId: id });

      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("passkey.update.error", error, { userId, passkeyId: id });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);

export const DELETE = withRequestContext(
  withAuth<RouteParams>("passkey.delete")(async (_request: Request, { params, auth }) => {
    const { userId } = auth;
    const { id } = await params;

    try {
      const passkey = await getPasskeyById(id);

      if (!passkey || passkey.userId !== userId) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      const passkeyCount = await getPasskeyCountByUserId(userId);

      if (passkeyCount <= 1) {
        logWarn("passkey.delete.last_passkey", { userId, passkeyId: id });
      }

      const deleted = await deletePasskey(id, userId);

      if (!deleted) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      logInfo("passkey.delete.success", { userId, passkeyId: id });

      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("passkey.delete.error", error, { userId, passkeyId: id });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
