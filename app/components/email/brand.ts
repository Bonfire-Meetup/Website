export const BRAND = {
  bonfire: "#ff5555",
  ember: "#f97316",
  magenta: "#f43f5e",
  coral: "#f59e0b",
} as const;

export const FIRE_GRADIENT = `linear-gradient(90deg, ${BRAND.ember} 0%, ${BRAND.bonfire} 50%, ${BRAND.magenta} 100%)`;

export const FIRE_GRADIENT_DIAGONAL = `linear-gradient(135deg, ${BRAND.bonfire} 0%, ${BRAND.magenta} 100%)`;
