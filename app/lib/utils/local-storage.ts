import { logWarn } from "@/lib/utils/log-client";

export function readLocalStorage<T>(key: string): T | null {
  if (typeof window === "undefined") {
    return null;
  }
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch (error) {
    logWarn("local_storage.read_failed", { key, error: String(error) });
    return null;
  }
}

export function writeLocalStorage(key: string, value: unknown): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    logWarn("local_storage.write_failed", { key, error: String(error) });
  }
}

export function removeFromLocalStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    localStorage.removeItem(key);
  } catch (error) {
    logWarn("local_storage.remove_failed", { key, error: String(error) });
  }
}
