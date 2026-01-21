export type SitemapUrl = {
  loc: string;
  lastmod?: string;
};

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderUrlEntry({ loc, lastmod }: SitemapUrl) {
  const escapedLoc = escapeXml(loc);
  const escapedLastmod = lastmod ? escapeXml(lastmod) : null;
  return [
    "  <url>",
    `    <loc>${escapedLoc}</loc>`,
    escapedLastmod ? `    <lastmod>${escapedLastmod}</lastmod>` : null,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildSitemapXml(urls: SitemapUrl[]) {
  const items = urls.map(renderUrlEntry).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${items}\n` +
    `</urlset>\n`;
}

export function buildSitemapIndexXml(sitemaps: SitemapUrl[]) {
  const items = sitemaps
    .map(({ loc, lastmod }) => {
      const escapedLoc = escapeXml(loc);
      const escapedLastmod = lastmod ? escapeXml(lastmod) : null;
      return [
        "  <sitemap>",
        `    <loc>${escapedLoc}</loc>`,
        escapedLastmod ? `    <lastmod>${escapedLastmod}</lastmod>` : null,
        "  </sitemap>",
      ]
        .filter(Boolean)
        .join("\n");
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    `${items}\n` +
    `</sitemapindex>\n`;
}
