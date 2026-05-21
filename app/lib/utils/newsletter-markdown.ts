const LINK_STYLE = "color: #f97316; text-decoration: underline;";

export function parseInlineMarkdown(text: string): string {
  return text
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^)]+)\)/gu,
      `<a href="$2" style="${LINK_STYLE}" target="_blank" rel="noopener noreferrer">$1</a>`,
    )
    .replace(/\*\*(.+?)\*\*/gu, '<strong style="font-weight: bold;">$1</strong>')
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/gu, '<em style="font-style: italic;">$1</em>')
    .replace(/__(.+?)__/gu, "<u>$1</u>");
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
