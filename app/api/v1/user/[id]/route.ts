import crypto from "crypto";

import { NextResponse } from "next/server";

import { getAuthUserById } from "@/lib/data/auth";
import { logError } from "@/lib/utils/log";
import { runWithRequestContext } from "@/lib/utils/request-context";
import { decompressUuid } from "@/lib/utils/uuid-compress";

const hashEmail = (email: string): string =>
  crypto.createHash("sha256").update(email.toLowerCase().trim()).digest("hex");

export const GET = async (request: Request, { params }: { params: Promise<{ id: string }> }) =>
  runWithRequestContext(request, async () => {
    const respond = (body: unknown, init?: ResponseInit) => NextResponse.json(body, init);

    try {
      const { id } = await params;
      const userId = decompressUuid(id);

      if (!userId) {
        return respond({ error: "invalid_id" }, { status: 400 });
      }

      const user = await getAuthUserById(userId);
      if (!user) {
        return respond({ error: "not_found" }, { status: 404 });
      }
      if (!user.public_profile) {
        return respond({ error: "private_profile" }, { status: 403 });
      }

      return respond({
        createdAt: user.created_at.toISOString(),
        emailHash: hashEmail(user.email),
        name: user.name,
      });
    } catch (error) {
      logError("user.profile.fetch_failed", error);
      return respond({ error: "internal_error" }, { status: 500 });
    }
  });
