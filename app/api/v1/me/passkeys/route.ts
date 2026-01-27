import { NextResponse } from "next/server";

import { requireAuth } from "@/lib/api/auth";
import { getPasskeysByUserId } from "@/lib/data/passkey";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";

export const GET = async (request: Request) =>
  runWithRequestContext(request, async () => {
    const authResult = await requireAuth(request, "passkey.list");

    if (!authResult.success) {
      return authResult.response;
    }

    const { userId } = authResult;

    try {
      const passkeys = await getPasskeysByUserId(userId);

      return NextResponse.json({
        items: passkeys.map((passkey) => ({
          id: passkey.id,
          name: passkey.name,
          deviceType: passkey.device_type,
          backedUp: passkey.backed_up,
          createdAt: passkey.created_at.toISOString(),
          lastUsedAt: passkey.last_used_at?.toISOString() ?? null,
        })),
      });
    } catch (error) {
      logError("passkey.list.error", error, { userId });
      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  });
