export function normalizeText(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function sanitizeUserText(value: string) {
  return value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .split("")
    .filter((char) => {
      const code = char.charCodeAt(0);
      if (code === 9 || code === 10) {
        return true;
      }

      return !((code >= 0 && code <= 8) || (code >= 11 && code <= 31) || code === 127);
    })
    .join("")
    .trim();
}
