export function parseEventTitle(title: string) {
  const match = title.match(/^(?<prefix>.+?)\s*[-–—:]\s*(?<subtitle>.+)$/u);
  if (match?.groups?.prefix && match.groups.subtitle) {
    return { prefix: match.groups.prefix, subtitle: match.groups.subtitle };
  }
  return null;
}
