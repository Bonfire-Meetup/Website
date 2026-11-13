/** Up to two initials: first and last word, ignoring punctuation. "Šárka Tmějová" -> "ŠT". */
export function getInitials(name: string): string {
  const initials = name
    .trim()
    .split(/\s+/u)
    .map((word) => word.match(/[\p{L}\p{N}]/u)?.[0]?.toUpperCase() ?? "")
    .filter(Boolean);

  if (initials.length <= 1) {
    return initials[0] ?? "";
  }
  return `${initials[0]}${initials[initials.length - 1]}`;
}
