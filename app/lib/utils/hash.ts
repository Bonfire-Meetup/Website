import "server-only";

import crypto from "crypto";

export function sha256WithSalt(value: string, salt: string): string {
  return crypto.createHash("sha256").update(`${value}:${salt}`).digest("hex");
}
