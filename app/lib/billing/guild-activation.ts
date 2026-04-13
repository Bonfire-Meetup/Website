import { STORAGE_KEYS } from "@/lib/storage/keys";
import {
  readLocalStorage,
  removeFromLocalStorage,
  writeLocalStorage,
} from "@/lib/utils/local-storage";

interface GuildActivationLock {
  startedAt: number;
  tier: 1 | 2 | 3;
}

const GUILD_ACTIVATION_TTL_MS = 10 * 60 * 1000;

function isValidTier(value: unknown): value is 1 | 2 | 3 {
  return value === 1 || value === 2 || value === 3;
}

export function readGuildActivationLock(): GuildActivationLock | null {
  const value = readLocalStorage<GuildActivationLock>(STORAGE_KEYS.GUILD_ACTIVATION);

  if (!value || typeof value.startedAt !== "number" || !isValidTier(value.tier)) {
    removeFromLocalStorage(STORAGE_KEYS.GUILD_ACTIVATION);
    return null;
  }

  if (Date.now() - value.startedAt > GUILD_ACTIVATION_TTL_MS) {
    removeFromLocalStorage(STORAGE_KEYS.GUILD_ACTIVATION);
    return null;
  }

  return value;
}

export function beginGuildActivationLock(tier: 1 | 2 | 3): void {
  writeLocalStorage(STORAGE_KEYS.GUILD_ACTIVATION, {
    startedAt: Date.now(),
    tier,
  } satisfies GuildActivationLock);
}

export function clearGuildActivationLock(): void {
  removeFromLocalStorage(STORAGE_KEYS.GUILD_ACTIVATION);
}
