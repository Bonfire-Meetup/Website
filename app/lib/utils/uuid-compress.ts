const BASE58_ALPHABET = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz";
const TOTAL_LEN = 22;
const GROUP_A = 11;

function encodeBase58(buffer: Buffer): string {
  let value = BigInt(`0x${buffer.toString("hex")}`);

  if (value === 0n) {
    return "1".repeat(TOTAL_LEN);
  }

  let output = "";
  while (value > 0n) {
    const index = Number(value % 58n);
    output = BASE58_ALPHABET[index] + output;
    value /= 58n;
  }

  return output.padStart(TOTAL_LEN, "1");
}

function decodeBase58(input: string): Buffer | null {
  const normalized = input.replace(/[-_.]/g, "");
  if (normalized.length !== TOTAL_LEN) {
    return null;
  }
  if (!/^[1-9A-HJ-NP-Za-km-z]+$/.test(normalized)) {
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
  return Buffer.from(hex, "hex");
}

function groupBase58_11_11(value: string): string {
  return `${value.slice(0, GROUP_A)}-${value.slice(GROUP_A)}`;
}

export function compressUuid(uuid: string): string {
  const hex = uuid.replace(/-/g, "");
  if (!/^[0-9a-fA-F]{32}$/.test(hex)) {
    throw new Error("Invalid UUID");
  }

  const bytes = Buffer.from(hex, "hex");
  const base58 = encodeBase58(bytes);
  return groupBase58_11_11(base58);
}

export function decompressUuid(compressed: string): string | null {
  const bytes = decodeBase58(compressed);
  if (!bytes) {
    return null;
  }

  const hex = bytes.toString("hex");
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}
