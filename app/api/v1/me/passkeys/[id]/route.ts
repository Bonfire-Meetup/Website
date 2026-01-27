import { NextResponse } from "next/server";
import { z } from "zod";

import { requireAuth } from "@/lib/api/auth";
import {
  deletePasskey,
  getPasskeyById,
  getPasskeyCountByUserId,
  updatePasskeyName,
} from "@/lib/data/passkey";
import { logError, logInfo, logWarn } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

interface RouteParams {
  params: Promise<{ id: string }>;
}

const updateSchema = z.object({
  name: z.string().max(100).nullable(),
});

export const PATCH = async (request: Request, { params }: RouteParams) =>
  runWithRequestContext(request, async () => {
    const authResult = await requireAuth(request, "passkey.update");

    if (!authResult.success) {
      return authResult.response;
    }

    const { userId } = authResult;
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

      if (!passkey || passkey.user_id !== userId) {
        return NextResponse.json({ error: "not_found" }, { status: 404 });
      }

      await updatePasskeyName(id, userId, result.data.name);

      logInfo("passkey.update.success", { userId, passkeyId: id });

      return NextResponse.json({ ok: true });
    } catch (error) {
      logError("passkey.update.error", error, { userId, passkeyId: id });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });

export const DELETE = async (request: Request, { params }: RouteParams) =>
  runWithRequestContext(request, async () => {
    const authResult = await requireAuth(request, "passkey.delete");

    if (!authResult.success) {
      return authResult.response;
    }

    const { userId } = authResult;
    const { id } = await params;

    try {
      const passkey = await getPasskeyById(id);

      if (!passkey || passkey.user_id !== userId) {
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
  });
