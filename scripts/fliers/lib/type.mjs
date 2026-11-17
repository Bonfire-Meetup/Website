import fs from "node:fs";
import path from "node:path";

import opentype from "opentype.js";

const fontsDir = path.resolve(import.meta.dirname, "../node_modules/geist/dist/fonts");

const FILES = {
  black: "geist-sans/Geist-Black.ttf",
  bold: "geist-sans/Geist-Bold.ttf",
  medium: "geist-sans/Geist-Medium.ttf",
  mono: "geist-mono/GeistMono-Medium.ttf",
  monoBold: "geist-mono/GeistMono-SemiBold.ttf",
};

/** Cap height of Geist as a fraction of the font size. */
export const CAP = 0.71;

const cache = new Map();

function loadFont(key) {
  if (!cache.has(key)) {
    const buffer = fs.readFileSync(path.join(fontsDir, FILES[key]));
    cache.set(
      key,
      opentype.parse(buffer.buffer.slice(buffer.byteOffset, buffer.byteOffset + buffer.byteLength)),
    );
  }
  return cache.get(key);
}

// Text is drawn as outlines, so print output never depends on installed fonts.
function layoutGlyphs(text, { font, size, tracking = 0 }) {
  const face = loadFont(font);
  const scale = size / face.unitsPerEm;
  const glyphs = face.stringToGlyphs(text.replace(/ /g, " "));
  const placed = [];
  let x = 0;

  glyphs.forEach((glyph, index) => {
    placed.push({ glyph, x });
    x += (glyph.advanceWidth ?? 0) * scale;
    if (index < glyphs.length - 1) {
      const kerning = face.getKerningValue(glyph, glyphs[index + 1]);
      x += (Number.isFinite(kerning) ? kerning : 0) * scale + tracking * size;
    }
  });

  return { placed, width: x };
}

export function measure(text, style) {
  return layoutGlyphs(text, style).width;
}

export function textPath({ x, y, text, font, size, tracking = 0, fill, anchor = "start" }) {
  const { placed, width } = layoutGlyphs(text, { font, size, tracking });
  const left = anchor === "end" ? x - width : anchor === "middle" ? x - width / 2 : x;
  const d = placed
    .map(({ glyph, x: offset }) => glyph.getPath(left + offset, y, size).toPathData(2))
    .join("");
  return `<path d="${d}" fill="${fill}"/>`;
}

export function textBlock({ x, y, lines, lineHeight = 1.1, ...style }) {
  return lines
    .map((line, index) =>
      textPath({ ...style, x, y: y + index * style.size * lineHeight, text: line }),
    )
    .join("");
}

// Czech typography: a one-letter preposition or conjunction never ends a line, and a dash
// never starts one.
function bindShortWords(text) {
  return text.replace(/(^|\s)([aikosuvzAIKOSUVZ])\s+/g, "$1$2 ").replace(/\s+([–—])(?=\s)/g, " $1");
}

export function wrap(text, style, maxWidth, maxLines = Infinity) {
  const words = bindShortWords(String(text).trim())
    .split(/[ \t\n\r]+/)
    .filter(Boolean);
  const lines = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (!current || measure(next, style) <= maxWidth) {
      current = next;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) {
    lines.push(current);
  }

  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = lines.slice(maxLines - 1).join(" ");
    while (last.length > 1 && measure(`${last}…`, style) > maxWidth) {
      last = last.slice(0, -1).trimEnd();
    }
    kept[maxLines - 1] = `${last}…`;
    return kept;
  }

  return lines;
}

/** Largest size at which every line fits the width. */
export function fitSize(lines, style, maxWidth, maxSize, minSize) {
  let size = maxSize;
  while (size > minSize && lines.some((line) => measure(line, { ...style, size }) > maxWidth)) {
    size -= 2;
  }
  return size;
}
