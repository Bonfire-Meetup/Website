#!/usr/bin/env node
/**
 * Migration: split a monolithic app/data/photo-albums.json into
 *   app/data/photo-albums/summary.json
 *   app/data/photo-albums/albums/<id>.json  (only { "images": [...] })
 * then runs scripts/refresh-photo-albums-data.mjs
 *
 * Usage: node scripts/split-photo-albums.mjs path/to/photo-albums.json
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, "..");
const sourceArg = process.argv[2];
if (!sourceArg) {
  console.error("usage: node scripts/split-photo-albums.mjs path/to/photo-albums.json");
  process.exit(1);
}
const sourcePath = path.resolve(repoRoot, sourceArg);
const outDir = path.join(repoRoot, "app/data/photo-albums");
const albumsDir = path.join(outDir, "albums");

const raw = JSON.parse(fs.readFileSync(sourcePath, "utf8"));
const { baseUrl, albums } = raw;

if (!baseUrl || !Array.isArray(albums)) {
  throw new Error("Invalid photo-albums.json shape");
}

fs.mkdirSync(albumsDir, { recursive: true });

const summaries = [];

for (const album of albums) {
  const { images, ...rest } = album;
  if (!Array.isArray(images)) {
    throw new Error(`Album ${album.id}: missing images`);
  }
  if (rest.count !== images.length) {
    throw new Error(`Album ${album.id}: count ${rest.count} !== images.length ${images.length}`);
  }
  summaries.push(rest);
  const albumPath = path.join(albumsDir, `${album.id}.json`);
  fs.writeFileSync(albumPath, `${JSON.stringify({ images }, null, 2)}\n`, "utf8");
}

const summaryPayload = { baseUrl, albums: summaries };
fs.writeFileSync(
  path.join(outDir, "summary.json"),
  `${JSON.stringify(summaryPayload, null, 2)}\n`,
  "utf8",
);

execSync("node scripts/refresh-photo-albums-data.mjs", { cwd: repoRoot, stdio: "inherit" });

console.log(`Wrote ${summaries.length} album image files and summary.json`);
