import { decompressUuid } from "@/lib/utils/uuid-compress";

const CROCKFORD = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
const CROCKFORD_MAP: Record<string, number> = Object.fromEntries(
  CROCKFORD.split("").map((c, i) => [c, i]),
);

function u64ToBase32(id: bigint): string {
  if (id === 0n) {
    return "0";
  }
  let x = id;
  let out = "";
  while (x > 0n) {
    const digit = Number(x & 31n);
    out = CROCKFORD[digit] + out;
    x >>= 5n;
  }
  return out;
}

function base32ToU64(s: string): bigint | null {
  const t = s.toUpperCase();
  let x = 0n;
  for (const ch of t) {
    const v = CROCKFORD_MAP[ch];
    if (v === undefined) {
      return null;
    }
    x = (x << 5n) | BigInt(v);
  }
  return x;
}

function crc8(bytes: Uint8Array): number {
  let crc = 0;
  for (const b of bytes) {
    crc ^= b;
    for (let i = 0; i < 8; i++) {
      crc = crc & 0x80 ? ((crc << 1) ^ 0x07) & 0xff : (crc << 1) & 0xff;
    }
  }
  return crc & 0xff;
}

function stringToBytesAscii(s: string): Uint8Array {
  const out = new Uint8Array(s.length);
  for (let i = 0; i < s.length; i++) {
    out[i] = s.charCodeAt(i) & 0xff;
  }
  return out;
}

export function makeAvatarSeedFromId(id: bigint): string {
  const b32 = u64ToBase32(id);
  const c = crc8(stringToBytesAscii(`av1|${b32}`)) & 0x3ff;
  const c1 = CROCKFORD[(c >> 5) & 31];
  const c2 = CROCKFORD[c & 31];
  return `av1_${b32}_${c1}${c2}`;
}

export function makeAvatarSeedFromPublicId(publicId: string): string {
  const uuid = decompressUuid(publicId);
  if (uuid === null) {
    return publicId;
  }
  return makeAvatarSeedFromId(hashToU64(uuid));
}

export function readIdFromAvatarSeed(seed: string): bigint | null {
  const m = /^av1_([0-9A-Z]+)_([0-9A-Z]{2})$/i.exec(seed.trim());
  if (!m) {
    return null;
  }
  const b32 = m[1].toUpperCase();
  const chk = m[2].toUpperCase();
  const id = base32ToU64(b32);
  if (id === null) {
    return null;
  }

  const expected = crc8(stringToBytesAscii(`av1|${b32}`)) & 0x3ff;
  const c1 = CROCKFORD[(expected >> 5) & 31];
  const c2 = CROCKFORD[expected & 31];
  if (`${c1}${c2}` !== chk) {
    return null;
  }

  return id;
}

export function hashToU64(input: string): bigint {
  let h = 0xcbf29ce484222325n;
  const prime = 0x100000001b3n;
  for (let i = 0; i < input.length; i++) {
    h ^= BigInt(input.charCodeAt(i));
    h = (h * prime) & 0xffffffffffffffffn;
  }
  return h;
}

export function hashToU32(input: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

function u32(x: number) {
  return x >>> 0;
}

function sfc32(a: number, b: number, c: number, d: number) {
  let A = u32(a),
    B = u32(b),
    C = u32(c),
    D = u32(d);
  return () => {
    const t = u32(A + B);
    A = u32(B ^ (B >>> 9));
    B = u32(C + (C << 3));
    C = u32((C << 21) | (C >>> 11));
    D = u32(D + 1);
    const r = u32(t + D);
    C = u32(C + r);
    return r / 4294967296;
  };
}

export function rngFromId(id: bigint) {
  const lo = Number(id & 0xffffffffn);
  const hi = Number((id >> 32n) & 0xffffffffn);
  const a = u32(lo ^ 0x9e3779b9);
  const b = u32(hi ^ 0x243f6a88);
  const c = u32((lo + hi) ^ 0xb7e15162);
  const d = u32(lo ^ (hi << 1) ^ 0xdeadbeef);
  return sfc32(a, b, c, d);
}

export function randInt(rnd: () => number, min: number, max: number) {
  return Math.floor(rnd() * (max - min + 1)) + min;
}

export function pick<T>(rnd: () => number, arr: readonly T[]): T {
  const el = arr[Math.floor(rnd() * arr.length)];
  if (el === undefined) {
    throw new Error("pick: empty array");
  }
  return el;
}

export function clamp(n: number, a: number, b: number) {
  return Math.max(a, Math.min(b, n));
}

export function round2(n: number) {
  return Math.round(n * 100) / 100;
}
