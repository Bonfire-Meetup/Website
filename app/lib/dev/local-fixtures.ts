import fs from "node:fs";
import path from "node:path";

/**
 * Stand-in community accounts for local development, read from the gitignored
 * `.dev-fixtures.json` in the repo root. Lets a speaker page and an account
 * profile be previewed together without a database row. Ignored outside
 * `next dev`.
 */
export interface DevAccountFixture {
  boostCount: number;
  createdAt: string;
  eventsAttended: number;
  membershipTier: number | null;
  name: string;
  publicId: string;
  roles: string[];
  speaker?: string;
}

const FIXTURE_FILE = ".dev-fixtures.json";

function loadAccounts(): DevAccountFixture[] {
  if (process.env.NODE_ENV !== "development") {
    return [];
  }

  try {
    const raw = fs.readFileSync(path.join(process.cwd(), FIXTURE_FILE), "utf8");
    const parsed = JSON.parse(raw) as { accounts?: DevAccountFixture[] };
    return parsed.accounts ?? [];
  } catch {
    return [];
  }
}

export function getDevAccountFixture(publicId: string): DevAccountFixture | undefined {
  return loadAccounts().find((account) => account.publicId === publicId);
}

export function getDevAccountFixtureForSpeaker(slug: string): DevAccountFixture | undefined {
  return loadAccounts().find((account) => account.speaker === slug);
}
