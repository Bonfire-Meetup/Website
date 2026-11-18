#!/usr/bin/env node

import { execFile } from "node:child_process";
import fs from "node:fs/promises";
import path from "node:path";
import { parseArgs, promisify } from "node:util";

import { loadFlierConfig, resolveFlierFile } from "./lib/event.mjs";
import { LANGUAGES, SIZES, renderFlier } from "./lib/flier.mjs";

const run = promisify(execFile);

const USAGE = `Bonfire event flier generator

Usage:
  node generate.mjs <event-id> [<event-id> ...] [--sizes a4,a3,a2] [--lang en,cs] [--no-pdf]

The date, venue and talks come from app/data/events-calendar.json and speakers.json.
scripts/fliers/events/<event-id>.json picks the photos and partners for the flier:

  photos     backdrop, flame, left, bottom: { album, index, focal } from app/data/photo-albums;
             a button without a talk photo shows its album photo
  partners   logo paths under public/, e.g. "partners/flyingrat_light.png"
  talks      per talk, keyed by speaker names joined with " & " (or group name), all optional:
             { button: "flame" | "left" | "bottom", focal: { x, y }, zoom (<1 adds room), title,
               album + index | file (from the repo root) | photo: false }
             Without a source, the speaker's photo from speakers.json is used. A talk with
             several speakers splits its button into slanted slices, one per speaker; set
             their source and framing under people: { "<name>": { album, focal, zoom, ... } }
  tba        start times shown as "to be announced" until the lineup is full
  venue      { name, address } when the calendar's venue line reads badly in print
  kicker, tagline, intro, badge, cta, url    { en, cs } overrides of the default wording

Writes print-ready PNGs (300 dpi) and PDFs (macOS sips) to scripts/fliers/output.
Sizes: ${Object.keys(SIZES).join(", ")} (default: all)
Languages: ${LANGUAGES.join(", ")} (default: all)
`;

function listOption(value, allowed, label) {
  const items = value.split(",").map((item) => item.trim().toLowerCase());
  const unknown = items.filter((item) => !allowed.includes(item));
  if (unknown.length > 0) {
    throw new Error(`Unknown ${label}: ${unknown.join(", ")}`);
  }
  return items;
}

async function main() {
  const { values, positionals } = parseArgs({
    allowPositionals: true,
    options: {
      help: { type: "boolean", short: "h" },
      lang: { type: "string", default: LANGUAGES.join(",") },
      "no-pdf": { type: "boolean" },
      sizes: { type: "string", default: Object.keys(SIZES).join(",") },
    },
  });

  if (values.help || positionals.length === 0) {
    process.stdout.write(USAGE);
    return;
  }

  const sizes = listOption(values.sizes, Object.keys(SIZES), "size");
  const languages = listOption(values.lang, LANGUAGES, "language");
  const outputDir = path.join(import.meta.dirname, "output");
  await fs.mkdir(outputDir, { recursive: true });

  for (const arg of positionals) {
    const config = await loadFlierConfig(await resolveFlierFile(arg));
    for (const lang of languages) {
      for (const size of sizes) {
        const png = path.join(outputDir, `${config.id}-${lang}-${size}.png`);
        await (await renderFlier(config, size, lang)).toFile(png);
        process.stdout.write(`${png}\n`);

        if (!values["no-pdf"]) {
          const pdf = png.replace(/\.png$/, ".pdf");
          try {
            // The PNG carries 300 dpi, so the page comes out at true size.
            await run("sips", ["-s", "format", "pdf", png, "--out", pdf]);
            process.stdout.write(`${pdf}\n`);
          } catch {
            process.stderr.write(`Skipped PDF for ${path.basename(png)} (needs macOS sips).\n`);
          }
        }
      }
    }
  }
}

main().catch((error) => {
  process.stderr.write(`${error.message ?? error}\n`);
  process.exit(1);
});
