export function parseEventTitle(title: string) {
  const match = title.match(/^(.+?)\s*[-–—:]\s*(.+)$/);
  if (match) {
    return { prefix: match[1], subtitle: match[2] };
  }
  return null;
}
