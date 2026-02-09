export const BRAND = {
  bonfire: "#ff5555",
  violet: "#8b5cf6",
  magenta: "#f43f5e",
  coral: "#f59e0b",
} as const;

export const FIRE_GRADIENT = `linear-gradient(90deg, ${BRAND.violet} 0%, ${BRAND.bonfire} 50%, ${BRAND.magenta} 100%)`;

export const FIRE_GRADIENT_DIAGONAL = `linear-gradient(135deg, ${BRAND.bonfire} 0%, ${BRAND.magenta} 100%)`;
