import { NextResponse } from "next/server";

import { rejectUnverifiedSubmission } from "@/lib/api/form-protection";
import { getClientHashes } from "@/lib/api/rate-limit";
import { withRateLimit, withRequestContext } from "@/lib/api/route-wrappers";
import { insertTalkProposal } from "@/lib/data/forms";
import { talkProposalCreateSchema, toFieldErrors } from "@/lib/forms/schemas";
import { logError, logInfo } from "@/lib/utils/log";

const MAX_PROPOSALS_PER_HOUR = 3;

/**
 * Submits a talk proposal.
 *
 * Requires a Cloudflare Turnstile token and the CSRF token from `GET /api/v1/csrf` in the
 * `X-CSRF-Token` header. Invalid fields come back in `fields`, keyed by field name.
 */
export const POST = withRequestContext(
  withRateLimit({
    maxHits: MAX_PROPOSALS_PER_HOUR,
    storeKey: "talk-proposals",
    windowSeconds: 3600,
  })(async (request: Request) => {
    const body = (await request.json().catch(() => null)) as { company?: unknown } | null;

    if (body?.company) {
      return NextResponse.json({ ok: true }, { status: 201 });
    }

    const parsed = talkProposalCreateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid_request", fields: toFieldErrors(parsed.error) },
        { status: 400 },
      );
    }

    const { turnstileToken, company: _company, ...proposal } = parsed.data;
    const rejected = await rejectUnverifiedSubmission(request, "talk_proposal", turnstileToken);

    if (rejected) {
      return rejected;
    }

    const { ipHash } = await getClientHashes();

    try {
      await insertTalkProposal({
        ...proposal,
        email: proposal.email.toLowerCase(),
        experience: proposal.experience || null,
        ipHash,
      });
      logInfo("form.talk_proposal_submitted", {
        ipHash,
        preferredLocation: proposal.preferredLocation,
      });

      return NextResponse.json({ ok: true }, { status: 201 });
    } catch (error) {
      logError("form.talk_proposal_failed", error, { ipHash });

      return NextResponse.json({ error: "internal_error" }, { status: 500 });
    }
  }),
);
