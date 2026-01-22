import crypto from "crypto";
import { serverEnv } from "@/lib/config/env";

const getOtpSecret = () => {
  return serverEnv.BNF_OTP_SECRET;
};

export const generateOtpCode = () => {
  const value = crypto.randomInt(0, 1_000_000);
  return value.toString().padStart(6, "0");
};

export const hashOtpCode = (email: string, code: string) => {
  const secret = getOtpSecret();
  return crypto.createHmac("sha256", secret).update(`${email}:${code}`).digest("hex");
};

export const timingSafeMatch = (left: string, right: string) => {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
};

export const generateChallengeToken = () => crypto.randomBytes(32).toString("hex");
