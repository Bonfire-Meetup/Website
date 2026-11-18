import sharp from "sharp";

import {
  COLORS,
  SYMBOL_BOX,
  coverPhoto,
  loadAlbumPhoto,
  loadLogo,
  loadPartnerLogo,
  loadPhoto,
  qrTile,
  symbolButtons,
} from "./assets.mjs";
import { CAP, fitSize, measure, textBlock, textPath, wrap } from "./type.mjs";

/** Print sizes at 300 dpi. The design is drawn on the A4 grid and scaled up. */
export const SIZES = {
  a4: { width: 2480, height: 3508 },
  a3: { width: 3508, height: 4961 },
  a2: { width: 4961, height: 7016 },
};

const BASE = SIZES.a4;
const PAD = 160;
const MONO_TRACKING = 0.08;

const GLOWS = {
  prague: [COLORS.purple, COLORS.orange, COLORS.red],
  zlin: [COLORS.blue, COLORS.purple, COLORS.orange],
};

export const LANGUAGES = ["en", "cs"];

const COPY = {
  en: {
    kicker: "Game dev meetup",
    tagline: ["Where", "game devs", "meet."],
    intro:
      "An evening of talks from people who make games, and plenty of time to meet the rest of the scene.",
    badge: "Free entry",
    cta: "Details & RSVP",
    lineupLabel: "On stage",
    partnersLabel: "Partners",
    afterTalks: "Then we just hang out and chat",
    tbaNote: "Speaker revealed soon",
    tbaTitle: "To be announced",
  },
  cs: {
    kicker: "Meetup herních vývojářů",
    tagline: ["Kde se", "herní vývojáři", "potkávají."],
    intro:
      "Přednášky od lidí, co dělají hry, a k tomu spousta času pokecat s ostatními. Přijď mezi nás!",
    badge: "Vstup zdarma",
    cta: "Víc info a RSVP",
    lineupLabel: "Program",
    partnersLabel: "Partneři",
    afterTalks: "A pak už jen volný pokec",
    tbaNote: "Brzy prozradíme, kdo vystoupí",
    tbaTitle: "Ještě tajíme",
  },
};

/** Picks one language out of every { en, cs } value in a config. */
function localize(value, lang) {
  if (Array.isArray(value)) {
    return value.map((item) => localize(item, lang));
  }
  if (value && typeof value === "object") {
    if ("en" in value || "cs" in value) {
      return value[lang] ?? value.en;
    }
    return Object.fromEntries(
      Object.entries(value).map(([key, item]) => [key, localize(item, lang)]),
    );
  }
  return value;
}

function formatDate(date, lang) {
  const [year, month, day] = date.split("-").map(Number);
  const value = new Date(Date.UTC(year, month - 1, day));
  const part = (options) =>
    new Intl.DateTimeFormat(lang === "cs" ? "cs-CZ" : "en-GB", {
      ...options,
      timeZone: "UTC",
    }).format(value);
  const weekday = part({ weekday: "long" });
  return {
    dayMonth: lang === "cs" ? `${day}. ${month}.` : `${day} ${part({ month: "short" })}`,
    weekday: weekday.charAt(0).toUpperCase() + weekday.slice(1),
    year: String(year),
  };
}

function speakerLine(slot) {
  const people = slot.speakers ?? [];
  const names = people.map((person) => person.name).join(slot.group ? ", " : " & ");
  const companies = [...new Set(people.map((person) => person.company).filter(Boolean))].join(
    " / ",
  );
  if (slot.group) {
    // A podcast crew or similar appears under its own name, members after it.
    return { lead: slot.group, rest: names };
  }
  return { lead: names, rest: companies };
}

/** Everything that is text or a vector shape, laid out on the A4 grid. */
function buildOverlay(config, { symbol }) {
  const W = BASE.width;
  const H = BASE.height;
  const copy = COPY[config.lang] ?? COPY.en;
  const date = formatDate(config.date, config.lang);
  let svg = "";
  const mono = (props) =>
    textPath({
      font: props.bold ? "monoBold" : "mono",
      tracking: MONO_TRACKING,
      ...props,
      text: props.text.toUpperCase(),
    });

  // Header: free-entry chip opposite the logo.
  const chipSize = 34;
  const chipText = config.badge ?? copy.badge;
  const chipW = measure(chipText.toUpperCase(), {
    font: "monoBold",
    size: chipSize,
    tracking: MONO_TRACKING,
  });
  const chipH = 84;
  const chipX = W - PAD - chipW - 110;
  const chipY = 140 + (150 - chipH) / 2;
  svg += `<rect x="${chipX}" y="${chipY}" width="${chipW + 110}" height="${chipH}" rx="${chipH / 2}" fill="${COLORS.fireEnd}" fill-opacity="0.16" stroke="${COLORS.fireMid}" stroke-opacity="0.5" stroke-width="3"/>`;
  svg += `<circle cx="${chipX + 44}" cy="${chipY + chipH / 2}" r="9" fill="url(#fire)"/>`;
  svg += mono({
    x: chipX + 70,
    y: chipY + chipH / 2 + chipSize * CAP * 0.5,
    text: chipText,
    size: chipSize,
    bold: true,
    fill: COLORS.text,
  });

  // Left column beside the symbol: what this is.
  const colW = symbol.x - 70 - PAD;
  const taglineStyle = { font: "black", tracking: -0.04 };
  const taglineSize = fitSize(config.tagline, taglineStyle, colW, 250, 120);
  const taglineLH = 0.96;
  const taglineH = (config.tagline.length - 1) * taglineSize * taglineLH + taglineSize * CAP;
  const introStyle = { font: "medium", size: 50 };
  const introLines = wrap(config.intro, introStyle, Math.min(colW, 1040), 4);
  const introH = (introLines.length - 1) * 50 * 1.38 + 50 * CAP;
  const blockH = 40 * CAP + 64 + taglineH + 78 + introH;
  let y = symbol.y + symbol.h - blockH - 40;

  svg += mono({
    x: PAD,
    y: y + 40 * CAP,
    text: config.kicker,
    size: 40,
    bold: true,
    fill: "url(#fire)",
  });
  y += 40 * CAP + 64;
  config.tagline.forEach((line, index) => {
    svg += textPath({
      ...taglineStyle,
      x: PAD,
      y: y + taglineSize * CAP + index * taglineSize * taglineLH,
      text: line,
      size: taglineSize,
      fill: index === config.taglineAccentLine ? "url(#fire)" : COLORS.text,
    });
  });
  y += taglineH + 78;
  svg += textBlock({
    ...introStyle,
    x: PAD,
    y: y + 50 * CAP,
    lines: introLines,
    lineHeight: 1.38,
    fill: COLORS.textSoft,
  });

  // Lower block, left: when and where.
  const lowerTop = 2030;
  const footerRule = 3050;
  const leftW = 880;
  svg += mono({
    x: PAD,
    y: lowerTop + 44 * CAP,
    text: config.eventName,
    size: 44,
    bold: true,
    fill: "url(#fire)",
  });
  const dateStyle = { font: "black", tracking: -0.045 };
  const dateSize = fitSize([date.dayMonth], dateStyle, leftW, 330, 200);
  let ly = lowerTop + 44 * CAP + 86 + dateSize * CAP;
  svg += textPath({
    ...dateStyle,
    x: PAD - 8,
    y: ly,
    text: date.dayMonth,
    size: dateSize,
    fill: COLORS.text,
  });
  ly += 122;
  svg += textPath({
    font: "bold",
    tracking: -0.02,
    x: PAD,
    y: ly,
    text: `${date.weekday} · ${config.time}`,
    size: 82,
    fill: COLORS.text,
  });
  ly += 56;
  svg += `<rect x="${PAD}" y="${ly}" width="96" height="6" rx="3" fill="url(#fire)"/>`;
  ly += 96;
  svg += textPath({
    font: "bold",
    x: PAD,
    y: ly,
    text: config.venue.name,
    size: 58,
    fill: COLORS.text,
  });
  const addressLines = wrap(config.venue.address, { font: "medium", size: 42 }, leftW, 3);
  svg += textBlock({
    font: "medium",
    size: 42,
    x: PAD,
    y: ly + 70,
    lines: addressLines,
    lineHeight: 1.36,
    fill: COLORS.textMuted,
  });

  // Lower block, right: the programme as a timeline.
  const railX = 1310;
  const timeRight = railX - 44;
  const textX = railX + 54;
  const textW = W - PAD - textX;
  svg += mono({
    x: textX,
    y: lowerTop + 44 * CAP,
    text: config.lineupLabel ?? copy.lineupLabel,
    size: 36,
    bold: true,
    fill: COLORS.textMuted,
  });

  const slotsTop = lowerTop + 44 * CAP + 96;
  const afterTalks = config.afterTalks === false ? null : (config.afterTalks ?? copy.afterTalks);
  const afterSize = 38;
  const afterGap = 74;
  const slotsBottom = footerRule - 70 - (afterTalks ? afterGap + afterSize * CAP : 0);
  let titleSize = 60;
  let slots;
  for (;;) {
    const titleStyle = { font: "bold", size: titleSize, tracking: -0.02 };
    slots = config.lineup.map((slot) => {
      const lines = slot.tba
        ? [slot.title ?? copy.tbaTitle]
        : wrap(slot.title, titleStyle, textW, 4);
      const titleH = (lines.length - 1) * titleSize * 1.14 + titleSize * CAP;
      const { lead, rest } = slot.tba ? {} : speakerLine(slot);
      const twoLines =
        rest &&
        measure(lead, { font: "bold", size: 42 }) +
          20 +
          measure(`· ${rest}`, { font: "medium", size: 42 }) >
          textW;
      return {
        ...slot,
        extra: twoLines ? 56 : 0,
        height: titleH + 34 + 42 * CAP,
        lines,
      };
    });
    const gap =
      (slotsBottom - slotsTop - slots.reduce((sum, slot) => sum + slot.height + slot.extra, 0)) /
      Math.max(1, slots.length);
    if (gap >= 64 || titleSize <= 40) {
      slots.gap = Math.min(Math.max(gap, 40), 210);
      break;
    }
    titleSize -= 2;
  }

  let sy = slotsTop;
  let lastDotY = slotsTop;
  slots.forEach((slot, index) => {
    const isLast = index === slots.length - 1;
    const dotY = sy + titleSize * CAP * 0.5;
    lastDotY = dotY;
    const nextY = sy + slot.height + slot.extra + slots.gap;
    if (!isLast) {
      svg += `<rect x="${railX - 1.5}" y="${dotY}" width="3" height="${nextY - sy}" fill="#ffffff" fill-opacity="0.2"/>`;
    }
    svg += slot.tba
      ? `<circle cx="${railX}" cy="${dotY}" r="11" fill="${COLORS.canvas}" stroke="#ffffff" stroke-opacity="0.45" stroke-width="3"/>`
      : `<circle cx="${railX}" cy="${dotY}" r="13" fill="url(#fire)"/>`;
    if (slot.time) {
      svg += textPath({
        font: "monoBold",
        x: timeRight,
        y: sy + titleSize * CAP * 0.5 + 40 * CAP * 0.5,
        text: slot.time,
        size: 40,
        anchor: "end",
        fill: slot.tba ? COLORS.textMuted : COLORS.text,
      });
    }
    svg += textBlock({
      font: "bold",
      tracking: -0.02,
      size: titleSize,
      x: textX,
      y: sy + titleSize * CAP,
      lines: slot.lines,
      lineHeight: 1.14,
      fill: slot.tba ? COLORS.textFaint : COLORS.text,
    });

    const lineY = sy + slot.height;
    if (slot.tba) {
      svg += textPath({
        font: "medium",
        x: textX,
        y: lineY,
        text: slot.note ?? copy.tbaNote,
        size: 42,
        fill: COLORS.textFaint,
      });
    } else {
      const { lead, rest } = speakerLine(slot);
      const leadStyle = { font: "bold", size: 42 };
      const restStyle = { font: "medium", size: 42 };
      const clip = (text, style) => {
        let clipped = text;
        while (clipped.length > 4 && measure(clipped, style) > textW) {
          clipped = `${clipped.slice(0, -2).trimEnd()}…`;
        }
        return clipped;
      };
      const leadText = clip(lead, leadStyle);
      svg += textPath({ ...leadStyle, x: textX, y: lineY, text: leadText, fill: COLORS.textSoft });
      if (rest) {
        const leadW = measure(leadText, leadStyle);
        const inline = leadW + 13 + measure(`· ${rest}`, restStyle) <= textW;
        svg += textPath({
          ...restStyle,
          x: inline ? textX + leadW + 13 : textX,
          y: inline ? lineY : lineY + 56,
          text: inline ? `· ${rest}` : clip(rest, restStyle),
          fill: COLORS.textMuted,
        });
      }
    }
    sy = nextY;
  });

  if (afterTalks) {
    const top = sy - slots.gap + Math.min(slots.gap, afterGap);
    const dotY = top + afterSize * CAP * 0.5;
    svg += `<rect x="${railX - 1.5}" y="${lastDotY}" width="3" height="${dotY - lastDotY}" fill="#ffffff" fill-opacity="0.2"/>`;
    svg += `<circle cx="${railX}" cy="${dotY}" r="8" fill="${COLORS.canvas}" stroke="url(#fire)" stroke-width="3"/>`;
    svg += textPath({
      font: "medium",
      x: textX,
      y: top + afterSize * CAP,
      text: afterTalks,
      size: afterSize,
      fill: COLORS.textSoft,
    });
  }

  // Footer: partners on the left, QR on the right.
  svg += `<rect x="${PAD}" y="${footerRule}" width="${W - PAD * 2}" height="3" fill="#ffffff" fill-opacity="0.14"/>`;
  svg += mono({
    x: PAD,
    y: footerRule + 68,
    text: config.partnersLabel ?? copy.partnersLabel,
    size: 28,
    bold: true,
    fill: COLORS.textFaint,
  });
  const qrSize = 230;
  const qrX = W - PAD - qrSize;
  const qrY = footerRule + 48;
  svg += qrTile({ url: config.url, x: qrX, y: qrY, size: qrSize });
  svg += mono({
    x: qrX + qrSize / 2,
    y: qrY + qrSize + 52,
    text: config.cta ?? copy.cta,
    size: 23,
    bold: true,
    anchor: "middle",
    fill: COLORS.textSoft,
  });

  return {
    svg: `<svg width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="fire" x1="0" y1="0" x2="1" y2="0.35"><stop offset="0%" stop-color="${COLORS.fireStart}"/><stop offset="55%" stop-color="${COLORS.fireMid}"/><stop offset="100%" stop-color="${COLORS.fireEnd}"/></linearGradient></defs>${svg}</svg>`,
    partnerArea: { x: PAD, y: footerRule + 96, w: qrX - 110 - PAD, h: 180 },
  };
}

// Logos sit on one row, balanced by visual weight (area) rather than height,
// so a compact mark and a long wordmark read as equals.
function fitPartners(logos, area) {
  const gap = 78;
  const maxH = 84;
  let targetArea = 17000;
  const size = () =>
    logos.map((logo) => {
      const aspect = logo.width / logo.height;
      const h = Math.min(maxH, Math.sqrt(targetArea / aspect));
      return { ...logo, w: h * aspect, h };
    });
  const rowWidth = (row) => row.reduce((sum, logo) => sum + logo.w, 0) + gap * (row.length - 1);
  while (rowWidth(size()) > area.w && targetArea > 5000) {
    targetArea -= 500;
  }

  let x = area.x;
  return size().map((logo) => {
    const placed = { ...logo, x, y: area.y + (area.h - logo.h) / 2 };
    x += logo.w + gap;
    return placed;
  });
}

/**
 * Several speakers in one button: each gets a slice, cut on a slant like a duo card, with a
 * thin fire-coloured seam between them so the slices read as one picture.
 */
async function splitPortraits(people, { w, h }) {
  const slant = w * 0.07;
  const step = w / people.length;
  const edge = (index) => ({ top: step * index + slant, bottom: step * index - slant });
  const layers = await Promise.all(
    people.map(async (person, index) => {
      const cellW = Math.round(Math.min(w, step + slant * 2 + w * 0.04));
      const cellX = Math.round(Math.min(Math.max(step * index - slant, 0), w - cellW));
      const left = index === 0 ? { top: 0, bottom: 0 } : edge(index);
      const right = index === people.length - 1 ? { top: w, bottom: w } : edge(index + 1);
      const slice = Buffer.from(
        `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><polygon points="${left.top},0 ${right.top},0 ${right.bottom},${h} ${left.bottom},${h}" fill="#fff"/></svg>`,
      );
      const photo = await (
        await coverPhoto(await loadPhoto(person), {
          w: cellW,
          h,
          focal: person.focal,
          zoom: person.zoom,
        })
      )
        .png()
        .toBuffer();
      return sharp({ create: { width: w, height: h, channels: 4, background: "#0000" } })
        .composite([
          { input: photo, left: cellX, top: 0 },
          { input: slice, blend: "dest-in" },
        ])
        .png()
        .toBuffer();
    }),
  );

  const seamW = Math.max(3, w * 0.012);
  const seams = people
    .slice(1)
    .map((_, index) => {
      const { top, bottom } = edge(index + 1);
      return `<line x1="${top}" y1="0" x2="${bottom}" y2="${h}" stroke="#000" stroke-opacity="0.35" stroke-width="${seamW * 3}"/><line x1="${top}" y1="0" x2="${bottom}" y2="${h}" stroke="url(#seam)" stroke-width="${seamW}"/>`;
    })
    .join("");
  const seam = Buffer.from(
    `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="seam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${COLORS.fireStart}"/><stop offset="0.55" stop-color="${COLORS.fireMid}"/><stop offset="1" stop-color="${COLORS.fireEnd}"/></linearGradient></defs>${seams}</svg>`,
  );

  return sharp({ create: { width: w, height: h, channels: 4, background: "#0000" } })
    .composite([...layers.map((input) => ({ input })), { input: seam }])
    .png()
    .toBuffer();
}

/** Buttons of the symbol, in the order of the talks they stand for. */
const BUTTON_ORDER = ["flame", "left", "bottom"];

export async function renderFlier(rawConfig, sizeKey, lang = "en") {
  const { kicker, tagline, intro } = COPY[lang] ?? COPY.en;
  const config = {
    kicker,
    tagline,
    intro,
    taglineAccentLine: 1,
    ...localize(rawConfig, lang),
    lang,
  };
  const { width, height } = SIZES[sizeKey];
  const k = width / BASE.width;
  const px = (value) => Math.round(value * k);
  const buttons = await symbolButtons();

  // The Bonfire symbol, large, on the right. Each of its buttons frames a photo.
  const symbolH = 1480;
  const symbolScale = symbolH / SYMBOL_BOX.h;
  const symbol = {
    h: symbolH,
    w: SYMBOL_BOX.w * symbolScale,
    x: BASE.width - PAD - SYMBOL_BOX.w * symbolScale,
    y: 360,
  };

  // Talks claim buttons in order unless a photo names the button that suits it.
  const talkPhotos = new Map();
  config.lineup.forEach((slot, index) => {
    const button = slot.photo?.button ?? BUTTON_ORDER[index];
    if (slot.photo && button) {
      talkPhotos.set(button, slot.photo);
    }
  });

  const layers = [];

  // 1. Backdrop photo, dimmed, fading into the canvas.
  const backdropH = 2200;
  const backdropFile = await loadAlbumPhoto(config.photos.backdrop);
  const backdrop = await (
    await coverPhoto(backdropFile, {
      w: width,
      h: px(backdropH),
      focal: config.photos.backdrop.focal,
    })
  )
    .blur(Math.max(1, 5 * k))
    .modulate({ brightness: 0.5, saturation: 0.75 })
    .png()
    .toBuffer();
  layers.push({ input: backdrop, left: 0, top: 0 });

  const scrim = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${BASE.width} ${BASE.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="down" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stop-color="${COLORS.canvas}" stop-opacity="0.62"/>
          <stop offset="0.16" stop-color="${COLORS.canvas}" stop-opacity="0.4"/>
          <stop offset="0.42" stop-color="${COLORS.canvas}" stop-opacity="0.72"/>
          <stop offset="${(backdropH - 240) / BASE.height}" stop-color="${COLORS.canvas}" stop-opacity="1"/>
        </linearGradient>
        <linearGradient id="side" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stop-color="${COLORS.canvas}" stop-opacity="0.72"/>
          <stop offset="0.6" stop-color="${COLORS.canvas}" stop-opacity="0"/>
        </linearGradient>
      </defs>
      <rect width="${BASE.width}" height="${BASE.height}" fill="url(#down)"/>
      <rect width="${BASE.width}" height="${backdropH}" fill="url(#side)"/>
    </svg>`);
  layers.push({ input: scrim, left: 0, top: 0 });

  // 2. Brand-colour light behind the symbol.
  const glowColors = GLOWS[config.chapter] ?? GLOWS.prague;
  const gs = 16;
  const cx = (symbol.x + symbol.w / 2) / gs;
  const cy = (symbol.y + symbol.h / 2) / gs;
  const r = symbol.h / gs;
  const glowSvg = `
    <svg width="${Math.ceil(BASE.width / gs)}" height="${Math.ceil(BASE.height / gs)}" xmlns="http://www.w3.org/2000/svg">
      <defs>${glowColors
        .map(
          (color, index) =>
            `<radialGradient id="g${index}"><stop offset="0" stop-color="${color}" stop-opacity="0.55"/><stop offset="1" stop-color="${color}" stop-opacity="0"/></radialGradient>`,
        )
        .join("")}</defs>
      <circle cx="${cx - r * 0.45}" cy="${cy - r * 0.42}" r="${r * 0.75}" fill="url(#g0)"/>
      <circle cx="${cx + r * 0.05}" cy="${cy + r * 0.05}" r="${r * 0.72}" fill="url(#g1)"/>
      <circle cx="${cx + r * 0.2}" cy="${cy + r * 0.55}" r="${r * 0.8}" fill="url(#g2)"/>
    </svg>`;
  const glow = await sharp(Buffer.from(glowSvg))
    .blur(4)
    .resize(width, height, { fit: "fill", kernel: "cubic" })
    .png()
    .toBuffer();
  layers.push({ input: glow, left: 0, top: 0, blend: "screen" });

  // 3. Photos cut into the three buttons.
  for (const [name, button] of Object.entries(buttons)) {
    // A talk's own photo (its speaker or group) takes the button; until there is
    // one, a photo from the last meetup stands in.
    const slotPhoto = talkPhotos.get(name);
    const photo = slotPhoto ?? config.photos[name];
    const rect = {
      x: px(symbol.x + button.box.x * symbolScale),
      y: px(symbol.y + button.box.y * symbolScale),
      w: px(button.box.w * symbolScale),
      h: px(button.box.h * symbolScale),
    };
    const s = rect.w / button.box.w;
    const mask = Buffer.from(
      `<svg width="${rect.w}" height="${rect.h}" xmlns="http://www.w3.org/2000/svg"><path d="${button.d}" transform="scale(${s} ${rect.h / button.box.h}) translate(${-button.box.x} ${-button.box.y})" fill="#fff"/></svg>`,
    );
    const filled = photo.people
      ? sharp(await splitPortraits(photo.people, rect))
      : await coverPhoto(await loadPhoto(photo), {
          w: rect.w,
          h: rect.h,
          focal: photo.focal,
          zoom: photo.zoom,
        });
    const framed = await filled
      .modulate({ brightness: 1.04, saturation: 1.05 })
      .composite([{ input: mask, blend: "dest-in" }])
      .png()
      .toBuffer();
    layers.push({ input: framed, left: rect.x, top: rect.y });
  }

  // 4. A wash of the brand gradient and a light rim tie the three photos together.
  const paths = Object.values(buttons)
    .map((button) => `<path d="${button.d}"/>`)
    .join("");
  const wash = Buffer.from(`
    <svg width="${width}" height="${height}" viewBox="0 0 ${BASE.width} ${BASE.height}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brand" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${SYMBOL_BOX.w}" y2="${SYMBOL_BOX.h}">
          <stop offset="0.05" stop-color="${glowColors[0]}" stop-opacity="0.34"/>
          <stop offset="0.5" stop-color="${COLORS.orange}" stop-opacity="0.1"/>
          <stop offset="1" stop-color="${COLORS.red}" stop-opacity="0.42"/>
        </linearGradient>
        <linearGradient id="rim" gradientUnits="userSpaceOnUse" x1="0" y1="0" x2="${SYMBOL_BOX.w}" y2="${SYMBOL_BOX.h}">
          <stop offset="0" stop-color="#ffffff" stop-opacity="0.65"/>
          <stop offset="0.5" stop-color="#ffffff" stop-opacity="0.15"/>
          <stop offset="1" stop-color="${COLORS.orange}" stop-opacity="0.85"/>
        </linearGradient>
      </defs>
      <g transform="translate(${symbol.x} ${symbol.y}) scale(${symbolScale})" fill="url(#brand)" stroke="url(#rim)" stroke-width="${5 / symbolScale}">${paths}</g>
    </svg>`);
  layers.push({ input: wash, left: 0, top: 0 });

  // 5. Fine grain, so gradients print without banding.
  const noise = await sharp({
    create: {
      width,
      height,
      channels: 3,
      background: { r: 128, g: 128, b: 128 },
      noise: { type: "gaussian", mean: 128, sigma: 7 },
    },
  })
    .greyscale()
    .png()
    .toBuffer();
  layers.push({ input: noise, left: 0, top: 0, blend: "soft-light" });

  // 6. Type, timeline, QR.
  const overlay = buildOverlay(config, { symbol });
  layers.push({
    input: await sharp(Buffer.from(overlay.svg), { density: 72 * k, limitInputPixels: false })
      .resize(width, height)
      .png()
      .toBuffer(),
    left: 0,
    top: 0,
  });

  // 7. Logos.
  layers.push({ input: await loadLogo(config.chapter, px(150)), left: px(PAD), top: px(140) });
  const partners = fitPartners(
    await Promise.all(config.partners.map((file) => loadPartnerLogo(file))),
    overlay.partnerArea,
  );
  for (const logo of partners) {
    layers.push({
      input: await sharp(logo.buffer)
        .resize(px(logo.w), px(logo.h), { fit: "fill" })
        .png()
        .toBuffer(),
      left: px(logo.x),
      top: px(logo.y),
    });
  }

  return sharp({ create: { width, height, channels: 3, background: COLORS.canvas } })
    .composite(layers)
    .withMetadata({ density: 300 })
    .png();
}
