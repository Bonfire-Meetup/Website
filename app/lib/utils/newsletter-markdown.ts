const LINK_STYLE = "color: #f97316; text-decoration: underline;";

export function parseInlineMarkdown(text: string): string {
  return text
    .replace(
      /\[(?<text>[^\]]+)\]\((?<url>https?:\/\/[^)]+)\)/gu,
      `<a href="$<url>" style="${LINK_STYLE}" target="_blank" rel="noopener noreferrer">$<text></a>`,
    )
    .replace(/\*\*(?<content>.+?)\*\*/gu, '<strong style="font-weight: bold;">$<content></strong>')
    .replace(
      /(?<!\*)\*(?!\*)(?<content>.+?)(?<!\*)\*(?!\*)/gu,
      '<em style="font-style: italic;">$<content></em>',
    )
    .replace(/__(?<content>.+?)__/gu, "<u>$<content></u>");
}

export function renderMarkdownToHtml(text: string): string {
  return text
    .split("\n\n")
    .map((paragraph) =>
      paragraph
        .split("\n")
        .map((line) => parseInlineMarkdown(line))
        .join("<br>"),
    )
    .map((html) => `<p style="margin: 0 0 16px;">${html}</p>`)
    .join("");
}
