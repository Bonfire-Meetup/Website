const enBadWords = new Set([
  "fuck",
  "shit",
  "damn",
  "bitch",
  "asshole",
  "bastard",
  "cunt",
  "piss",
  "cock",
  "dick",
  "pussy",
  "whore",
  "slut",
  "faggot",
  "nigger",
  "retard",
  "idiot",
  "moron",
  "stupid",
]);

const csBadWords = new Set([
  "kurva",
  "pica",
  "kokot",
  "zmrd",
  "srac",
  "debil",
  "idiot",
  "blbec",
  "pitomec",
  "hovno",
  "sracka",
  "prdel",
  "picus",
]);

const csEndings = ["i", "e", "y", "ové", "ci", "ky", "ku", "ka", "kem", "ovi", "ech", "ích"];

function removeDiacritics(text: string): string {
  const diacritics: Record<string, string> = {
    Á: "A",
    É: "E",
    Í: "I",
    Ó: "O",
    Ú: "U",
    Ý: "Y",
    á: "a",
    é: "e",
    í: "i",
    ó: "o",
    ú: "u",
    ý: "y",
    Č: "C",
    č: "c",
    Ď: "D",
    ď: "d",
    Ě: "E",
    ě: "e",
    Ň: "N",
    ň: "n",
    Ř: "R",
    ř: "r",
    Š: "S",
    š: "s",
    Ť: "T",
    ť: "t",
    Ů: "U",
    ů: "u",
    Ž: "Z",
    ž: "z",
  };

  return text.replace(/[áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ]/g, (char) => diacritics[char] || char);
}

function normalizeWord(word: string): string {
  return removeDiacritics(word)
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .trim();
}

function getWordStem(word: string, locale: "en" | "cs"): string {
  if (locale === "cs" && word.length > 4) {
    for (const ending of csEndings) {
      if (word.endsWith(ending) && word.length > ending.length + 2) {
        return word.slice(0, -ending.length);
      }
    }
  }
  return word;
}

function containsBadWord(text: string, badWords: Set<string>, locale: "en" | "cs"): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Split text into words using word boundaries (handles spaces, punctuation, etc.)
  // This regex matches sequences of letters (including accented characters)
  const wordMatches = text.match(/[\p{L}]+/gu);
  if (!wordMatches || wordMatches.length === 0) {
    return false;
  }

  for (const rawWord of wordMatches) {
    // Normalize each word individually
    const normalized = normalizeWord(rawWord);
    if (normalized && normalized.length >= 3) {
      const stem = getWordStem(normalized, locale);
      const wordVariants = [normalized, stem].filter((w) => w.length >= 3);

      for (const variant of wordVariants) {
        // Direct match
        if (badWords.has(variant)) {
          return true;
        }

        // Check for substring matches (handles variations like "kokoti" -> "kokot")
        for (const badWord of badWords) {
          if (variant.includes(badWord) || badWord.includes(variant)) {
            return true;
          }
        }
      }
    }
  }

  return false;
}

export function containsProfanity(text: string, locale: "en" | "cs" = "en"): boolean {
  if (!text || text.trim().length === 0) {
    return false;
  }

  // Check both language lists to catch profanity regardless of user's locale setting
  // This prevents users from bypassing filters by changing their language preference
  const primaryBadWords = locale === "cs" ? csBadWords : enBadWords;
  const secondaryBadWords = locale === "cs" ? enBadWords : csBadWords;

  // Check primary locale first, then secondary as fallback
  if (containsBadWord(text, primaryBadWords, locale)) {
    return true;
  }
  if (containsBadWord(text, secondaryBadWords, locale === "cs" ? "en" : "cs")) {
    return true;
  }

  return false;
}
