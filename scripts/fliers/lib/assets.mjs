import fs from "node:fs/promises";
import path from "node:path";

import QRCode from "qrcode";
import sharp from "sharp";

const repoRoot = path.resolve(import.meta.dirname, "../../..");
const cacheDir = path.resolve(import.meta.dirname, "../.cache/albums");
const albumsDir = path.join(repoRoot, "app/data/photo-albums");
const brandDir = path.join(repoRoot, "public/assets/brand");

export const COLORS = {
  canvas: "#09090b",
  text: "#fafafa",
  textSoft: "#d4d4d8",
  textMuted: "#a1a1aa",
  textFaint: "#71717a",
  fireStart: "#f97316",
  fireMid: "#ff5555",
  fireEnd: "#f43f5e",
  purple: "#a21caf",
  orange: "#f97316",
  red: "#dc2626",
  blue: "#2563eb",
};

export const CHAPTER_LOGOS = {
  prague: "RGB_SVG_06_bonfire-prague_white_symbol_gradient.svg",
  zlin: "RGB_SVG_09_bonfire-zlin_white_symbol_gradient.svg",
};

export const SYMBOL_BOX = { w: 433.8, h: 708.84 };

/**
 * The three buttons of the Bonfire symbol, in logo units, each with the box it
 * occupies. Photos are cut into these shapes.
 */
export async function symbolButtons() {
  const svg = await fs.readFile(path.join(brandDir, CHAPTER_LOGOS.prague), "utf8");
  const outlines = [...svg.matchAll(/<path[^>]*brandGradient[^>]*\sd="([^"]+)"/g)].map(
    (match) => `${match[1].split(/z/i)[0]}z`,
  );
  if (outlines.length !== 3) {
    throw new Error("Could not read the three symbol buttons from the logo artwork.");
  }
  const [left, bottom, flame] = outlines;
  return {
    flame: { d: flame, box: { x: 233.17, y: 0, w: 200.63, h: 311.7 } },
    left: { d: left, box: { x: 0, y: 275.04, w: 269.84, h: 200.63 } },
    bottom: { d: bottom, box: { x: 233.17, y: 439.01, w: 200.63, h: 269.83 } },
  };
}

export async function loadLogo(chapter, height) {
  const file = path.join(brandDir, CHAPTER_LOGOS[chapter]);
  return sharp(file, { density: 600 })
    .resize({ height: Math.round(height) })
    .png()
    .toBuffer();
}

async function download(url, file) {
  try {
    await fs.access(file);
  } catch {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Could not download ${url} (${response.status}).`);
    }
    await fs.mkdir(path.dirname(file), { recursive: true });
    await fs.writeFile(file, Buffer.from(await response.arrayBuffer()));
  }
  return file;
}

/** A photo from a local file, an album of the site, or a URL (cached). */
export async function loadPhoto(photo) {
  if (photo.file) {
    return photo.file;
  }
  if (photo.album) {
    return loadAlbumPhoto(photo);
  }
  // The ?v= content hash goes into the name, so a replaced photo is fetched again.
  const { pathname, searchParams } = new URL(photo.url);
  const version = searchParams.get("v");
  const name = version ? pathname.replace(/(\.\w+)$/, `-${version}$1`) : pathname;
  return download(photo.url, path.join(cacheDir, "..", "remote", name));
}

/** Fetches an album photo from the CDN once and keeps it in .cache. */
export async function loadAlbumPhoto({ album, index }) {
  const summary = JSON.parse(await fs.readFile(path.join(albumsDir, "summary.json"), "utf8"));
  const data = JSON.parse(
    await fs.readFile(path.join(albumsDir, "albums", `${album}.json`), "utf8"),
  );
  const image = data.images[index];
  if (!image) {
    throw new Error(`Album "${album}" has no photo #${index}.`);
  }

  return download(
    `${summary.baseUrl}/${image.src}`,
    path.join(cacheDir, album, path.basename(image.src)),
  );
}

/**
 * Crops a photo to w×h around the focal point. zoom > 1 crops tighter; zoom < 1 shows more
 * than the photo holds, continuing its edges as a soft blur.
 */
export async function coverPhoto(file, { w, h, focal = { x: 0.5, y: 0.5 }, zoom = 1 }) {
  const meta = await sharp(file).metadata();
  const scale = Math.max(w / meta.width, h / meta.height) * Math.min(Math.max(zoom, 0.5), 3);
  const cropW = Math.round(w / scale);
  const cropH = Math.round(h / scale);
  const place = (wanted, crop, size) =>
    Math.round(
      crop <= size
        ? Math.min(Math.max(wanted, 0), size - crop)
        : Math.min(Math.max(wanted, size - crop), 0),
    );
  let left = place(focal.x * meta.width - cropW / 2, cropW, meta.width);
  let top = place(focal.y * meta.height - cropH / 2, cropH, meta.height);

  let source = sharp(file);
  const pad = {
    left: Math.max(0, -left),
    top: Math.max(0, -top),
    right: Math.max(0, left + cropW - meta.width),
    bottom: Math.max(0, top + cropH - meta.height),
  };
  if (pad.left || pad.top || pad.right || pad.bottom) {
    const blurred = await sharp(file)
      .extend({ ...pad, extendWith: "copy" })
      .blur(Math.max(4, Math.min(meta.width, meta.height) / 30))
      .toBuffer();
    source = sharp(
      await sharp(blurred)
        .composite([{ input: await sharp(file).toBuffer(), left: pad.left, top: pad.top }])
        .png()
        .toBuffer(),
    );
    left += pad.left;
    top += pad.top;
  }

  return source
    .extract({ left, top, width: cropW, height: cropH })
    .resize(Math.round(w), Math.round(h), { fit: "fill", kernel: "lanczos3" });
}

/** Partner logo trimmed of empty margins, as a PNG buffer with its size. */
export async function loadPartnerLogo(file) {
  const buffer = await sharp(path.join(repoRoot, "public", file))
    .trim()
    .png()
    .toBuffer();
  const { width, height } = await sharp(buffer).metadata();
  return { buffer, width, height };
}

/** QR code as an SVG fragment: dark modules on a light rounded tile. */
export function qrTile({ url, x, y, size }) {
  const { modules } = QRCode.create(url, { errorCorrectionLevel: "M" });
  const quiet = 2;
  const cell = size / (modules.size + quiet * 2);
  let d = "";
  for (let row = 0; row < modules.size; row += 1) {
    for (let col = 0; col < modules.size; col += 1) {
      if (modules.get(row, col)) {
        const cx = (x + (col + quiet) * cell).toFixed(2);
        const cy = (y + (row + quiet) * cell).toFixed(2);
        d += `M${cx} ${cy}h${cell.toFixed(2)}v${cell.toFixed(2)}h-${cell.toFixed(2)}z`;
      }
    }
  }
  return `<rect x="${x}" y="${y}" width="${size}" height="${size}" rx="${size * 0.08}" fill="${COLORS.text}"/><path d="${d}" fill="${COLORS.canvas}"/>`;
}
