import { hashOtpCode, timingSafeMatch } from "@/app/lib/auth/otp";
import { getChallengeByToken, incrementAuthChallengeAttempts } from "@/app/lib/data/auth";

type VerificationResult =
  | { ok: true; id: string }
  | {
      ok: false;
      reason: "missing" | "used" | "expired" | "max_attempts" | "mismatch";
    };

export const timingGuardHash = hashOtpCode("nobody@bonfire.invalid", "000000");

export const verifyOtpChallenge = async ({
  email,
  challengeToken,
  code,
  timingGuard,
  incrementAttempts = true,
}: {
  email: string;
  challengeToken: string;
  code: string;
  timingGuard?: string;
  incrementAttempts?: boolean;
}): Promise<VerificationResult> => {
  const challengeTokenHash = hashOtpCode(email, challengeToken);
  const challenge = await getChallengeByToken(challengeTokenHash, email);
  if (!challenge) {
    if (timingGuard) timingSafeMatch(hashOtpCode(email, code), timingGuard);
    return { ok: false, reason: "missing" };
  }
  if (challenge.used_at) {
    if (timingGuard) timingSafeMatch(hashOtpCode(email, code), timingGuard);
    return { ok: false, reason: "used" };
  }
  if (challenge.expires_at <= new Date()) {
    if (timingGuard) timingSafeMatch(hashOtpCode(email, code), timingGuard);
    return { ok: false, reason: "expired" };
  }
  if (challenge.attempts >= challenge.max_attempts) {
    if (timingGuard) timingSafeMatch(hashOtpCode(email, code), timingGuard);
    return { ok: false, reason: "max_attempts" };
  }
  const codeHash = hashOtpCode(email, code);
  if (!timingSafeMatch(codeHash, challenge.code_hash)) {
    if (incrementAttempts) {
      await incrementAuthChallengeAttempts(challenge.id);
    }
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true, id: challenge.id };
};
