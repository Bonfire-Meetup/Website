"use client";

const modernPalettes = [
  [
    [139, 92, 246],
    [217, 70, 239],
    [244, 63, 94],
  ],
  [
    [59, 130, 246],
    [139, 92, 246],
    [236, 72, 153],
  ],
  [
    [34, 197, 94],
    [59, 130, 246],
    [168, 85, 247],
  ],
  [
    [251, 146, 60],
    [239, 68, 68],
    [236, 72, 153],
  ],
  [
    [168, 85, 247],
    [59, 130, 246],
    [34, 197, 94],
  ],
  [
    [236, 72, 153],
    [244, 63, 94],
    [251, 146, 60],
  ],
  [
    [34, 197, 94],
    [59, 130, 246],
    [139, 92, 246],
  ],
  [
    [244, 63, 94],
    [168, 85, 247],
    [59, 130, 246],
  ],
];

function generateAvatarStyles(hash: string) {
  const seed1 = parseInt(hash.slice(0, 8), 16);
  const seed2 = parseInt(hash.slice(8, 16), 16);
  const seed3 = parseInt(hash.slice(16, 24), 16);

  const palette = modernPalettes[seed1 % modernPalettes.length];
  const angle = (seed2 % 360) + 45;
  const radialX = 20 + (seed3 % 60);
  const radialY = 20 + (parseInt(hash.slice(24, 32), 16) % 60);

  const [c1, c2, c3] = palette;
  const [r1, g1, b1] = c1;
  const [r2, g2, b2] = c2;
  const [r3, g3, b3] = c3;

  const baseGrad = `linear-gradient(${angle}deg, rgb(${r1}, ${g1}, ${b1}) 0%, rgb(${r2}, ${g2}, ${b2}) 50%, rgb(${r3}, ${g3}, ${b3}) 100%)`;
  const radialGrad = `radial-gradient(circle at ${radialX}% ${radialY}%, rgba(${r2}, ${g2}, ${b2}, 0.6) 0%, transparent 65%)`;

  return {
    background: `${baseGrad}, ${radialGrad}`,
    backgroundPosition: "center, center",
    backgroundSize: "100% 100%, 150% 150%",
  };
}

function getInitials(name: string): string {
  const words = name
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (words.length === 0) {
    return "";
  }

  if (words.length === 1) {
    return words[0].charAt(0).toUpperCase().slice(0, 2);
  }

  const first = words[0].charAt(0).toUpperCase();
  const last = words[words.length - 1].charAt(0).toUpperCase();

  return (first + last).slice(0, 2);
}

interface UserAvatarProps {
  emailHash: string;
  size?: number;
  className?: string;
  name?: string | null;
  animated?: boolean;
}

export function UserAvatar({
  emailHash,
  size = 80,
  className = "",
  name,
  animated = false,
}: UserAvatarProps) {
  const styles = generateAvatarStyles(emailHash);
  const conicAngle = parseInt(emailHash.slice(24, 32), 16) % 360;
  const shimmerAngle = parseInt(emailHash.slice(0, 8), 16) % 360;
  const initials = name ? getInitials(name) : null;
  const fontSize = Math.max(12, Math.floor(size * 0.4));

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{
        height: size,
        width: size,
        ...styles,
      }}
    >
      <div
        className={`absolute inset-0 opacity-25 ${animated ? "animate-spin" : ""}`}
        style={{
          animationDuration: animated ? "10s" : undefined,
          background: `conic-gradient(from ${conicAngle}deg, transparent 0deg, rgba(255, 255, 255, 0.5) 45deg, transparent 90deg, rgba(255, 255, 255, 0.3) 135deg, transparent 180deg)`,
        }}
      />
      <div
        className="absolute inset-0 opacity-15"
        style={{
          background: `linear-gradient(${shimmerAngle}deg, transparent 30%, rgba(255, 255, 255, 0.2) 50%, transparent 70%)`,
        }}
      />
      {initials && (
        <span
          className="relative z-10 font-bold text-white drop-shadow-lg"
          style={{ fontSize: `${fontSize}px` }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
