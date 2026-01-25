const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const GROUP_SIZES = [4, 4, 4, 4, 6];

function encodeBase58(buffer: Buffer): string {
  let value = BigInt(`0x${buffer.toString("hex")}`);

  if (value === 0n) {
    return "1".repeat(22);
  }

  let output = "";
  while (value > 0n) {
    const index = Number(value % 58n);
    output = BASE58_ALPHABET[index] + output;
    value /= 58n;
  }

  return output.padStart(22, "1");
}

function decodeBase58(input: string): Buffer | null {
  const normalized = input.replace(/-/g, "");
  if (normalized.length !== 22) {
    return null;
  }

  let value = 0n;
  for (const char of normalized) {
    const index = BASE58_ALPHABET.indexOf(char);
    if (index === -1) {
      return null;
    }
    value = value * 58n + BigInt(index);
  }

  const hex = value.toString(16).padStart(32, "0");
  const buffer = Buffer.from(hex, "hex");
  return buffer.length === 16 ? buffer : null;
}

function groupBase58(value: string): string {
  const parts: string[] = [];
  let cursor = 0;

  for (const size of GROUP_SIZES) {
    parts.push(value.slice(cursor, cursor + size));
    cursor += size;
  }

  return parts.join("-");
}

export function compressUuid(uuid: string): string {
  const bytes = Buffer.from(uuid.replace(/-/g, ""), "hex");
  const base58 = encodeBase58(bytes);
  return groupBase58(base58);
}

export function decompressUuid(compressed: string): string | null {
  const bytes = decodeBase58(compressed);
  if (!bytes) {
    return null;
  }

  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
