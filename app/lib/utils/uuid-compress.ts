function toBase64Url(base64: string): string {
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function fromBase64Url(base64url: string): string {
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");
  const padding = (4 - (base64.length % 4)) % 4;
  return base64 + "=".repeat(padding);
}

export function compressUuid(uuid: string): string {
  const base64 = Buffer.from(uuid.replace(/-/g, ""), "hex").toString("base64");
  return toBase64Url(base64);
}

export function decompressUuid(compressed: string): string | null {
  try {
    const base64 = fromBase64Url(compressed);
    const hex = Buffer.from(base64, "base64").toString("hex");
    if (hex.length !== 32) {
      return null;
    }
    return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
  } catch {
    return null;
  }
}
