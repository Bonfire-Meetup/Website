#!/usr/bin/env node
/**
 * Regenerates app/lib/photos/photo-albums-data.ts (image imports + IMAGE_PAYLOADS only).
 * Summary and merge logic live in photo-album-summary.ts / photo-albums-resolve.ts.
 *
 * Usage: node scripts/refresh-photo-albums-data.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const summaryPath = path.join(repoRoot, "app/data/photo-albums/summary.json");
const albumsDir = path.join(repoRoot, "app/data/photo-albums/albums");
const outTs = path.join(repoRoot, "app/lib/photos/photo-albums-data.ts");

const summary = JSON.parse(fs.readFileSync(summaryPath, "utf8"));
const ids = summary.albums.map((a) => a.id);

for (const id of ids) {
  const p = path.join(albumsDir, `${id}.json`);
  if (!fs.existsSync(p)) {
    throw new Error(`Missing image file for album ${id}: ${p}`);
  }
}

function idToVar(id) {
  return id.replace(/-/g, "_").replace(/^(\d)/, "_$1");
}

const importLines = ids.map(
  (id) => `import ${idToVar(id)}Images from "@/data/photo-albums/albums/${id}.json";`,
);
const recordLines = ids.map((id) => `  "${id}": ${idToVar(id)}Images,`);

const dataTs = `${importLines.join("\n")}

import { photoAlbumsSummary } from "@/lib/photos/photo-album-summary";
import {
  findPhotoAlbumSummaryByKey,
  mergePhotoAlbumPayload,
} from "@/lib/photos/photo-albums-resolve";
import type { PhotoAlbum, PhotoAlbumImage } from "@/lib/photos/types";

const IMAGE_PAYLOADS: Record<string, { images: PhotoAlbumImage[] }> = {
${recordLines.join("\n")}
};

export function getAllFullPhotoAlbums(): PhotoAlbum[] {
  return photoAlbumsSummary.albums.map((meta) => {
    const payload = IMAGE_PAYLOADS[meta.id];
    if (!payload) {
      throw new Error(\`Missing image payload for album \${meta.id}\`);
    }
    return mergePhotoAlbumPayload(meta, payload);
  });
}

export function getFullPhotoAlbumById(albumKey: string): PhotoAlbum | undefined {
  const meta = findPhotoAlbumSummaryByKey(photoAlbumsSummary.albums, albumKey);
  if (!meta) {
    return undefined;
  }
  const payload = IMAGE_PAYLOADS[meta.id];
  if (!payload) {
    return undefined;
  }
  return mergePhotoAlbumPayload(meta, payload);
}
`;

fs.writeFileSync(outTs, dataTs, "utf8");
console.log(`Wrote ${outTs} (${ids.length} albums)`);
