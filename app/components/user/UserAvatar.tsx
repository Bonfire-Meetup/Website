"use client";

const palettes = [
  { colors: ["#8B5CF6", "#EC4899", "#F43F5E"], accent: "#FCD34D" },
  { colors: ["#3B82F6", "#8B5CF6", "#EC4899"], accent: "#34D399" },
  { colors: ["#10B981", "#3B82F6", "#8B5CF6"], accent: "#F472B6" },
  { colors: ["#F97316", "#EF4444", "#EC4899"], accent: "#38BDF8" },
  { colors: ["#A855F7", "#3B82F6", "#22C55E"], accent: "#FB923C" },
  { colors: ["#EC4899", "#F43F5E", "#F97316"], accent: "#2DD4BF" },
  { colors: ["#06B6D4", "#3B82F6", "#8B5CF6"], accent: "#FBBF24" },
  { colors: ["#F43F5E", "#A855F7", "#6366F1"], accent: "#4ADE80" },
  { colors: ["#14B8A6", "#06B6D4", "#3B82F6"], accent: "#F472B6" },
  { colors: ["#EAB308", "#F97316", "#EF4444"], accent: "#A78BFA" },
];

const patterns = ["circles", "rings", "dots", "wireframe", "mesh", "orbital"] as const;

function round(value: number, decimals = 2): number {
  const factor = 10 ** decimals;
  return Math.round(value * factor) / factor;
}

function seedToNumbers(seed: string): number[] {
  const numbers: number[] = [];
  let h = 2166136261;
  for (let i = 0; i < 32; i++) {
    const char = seed.charCodeAt(i % seed.length);
    h = Math.imul(h ^ char, 16777619);
    numbers.push((h >>> 0) % 1000);
  }
  return numbers;
}

function generateAvatar(seed: string) {
  const nums = seedToNumbers(seed);

  const paletteIndex = nums[0] % palettes.length;
  const palette = palettes[paletteIndex];
  const [c1, c2, c3] = palette.colors;
  const { accent } = palette;

  const patternType = patterns[nums[1] % patterns.length];
  const gradientAngle = nums[2] % 360;
  const radialOffsetX = 30 + (nums[3] % 40);
  const radialOffsetY = 30 + (nums[4] % 40);
  const complexity = 3 + (nums[5] % 4);

  const baseGradient = `linear-gradient(${gradientAngle}deg, ${c1} 0%, ${c2} 50%, ${c3} 100%)`;
  const radialGradient = `radial-gradient(circle at ${radialOffsetX}% ${radialOffsetY}%, ${c2}88 0%, transparent 50%)`;
  const accentGradient = `radial-gradient(circle at ${100 - radialOffsetX}% ${100 - radialOffsetY}%, ${accent}44 0%, transparent 40%)`;

  const patternElements: JSX.Element[] = [];

  switch (patternType) {
    case "circles": {
      for (let i = 0; i < complexity; i++) {
        const cx = nums[6 + i] % 100;
        const cy = nums[10 + i] % 100;
        const r = 8 + (nums[14 + i] % 25);
        const opacity = round(0.1 + (nums[18 + i] % 30) / 100);
        const color = i % 2 === 0 ? accent : "#ffffff";
        patternElements.push(
          <circle
            key={`circle-${i}`}
            cx={`${cx}%`}
            cy={`${cy}%`}
            r={`${r}%`}
            fill={color}
            opacity={opacity}
          />,
        );
      }
      break;
    }
    case "rings": {
      const centerX = 40 + (nums[6] % 20);
      const centerY = 40 + (nums[7] % 20);
      for (let i = 0; i < complexity + 1; i++) {
        const r = 15 + i * 12;
        const strokeWidth = 1 + (nums[8 + i] % 3);
        const opacity = round(0.15 + (nums[12 + i] % 20) / 100);
        const dashArray =
          nums[16 + i] % 2 === 0 ? "none" : `${4 + (nums[20 + i] % 8)} ${2 + (nums[24 + i] % 4)}`;
        patternElements.push(
          <circle
            key={`ring-${i}`}
            cx={`${centerX}%`}
            cy={`${centerY}%`}
            r={`${r}%`}
            fill="none"
            stroke={i % 2 === 0 ? "#ffffff" : accent}
            strokeWidth={strokeWidth}
            opacity={opacity}
            strokeDasharray={dashArray}
          />,
        );
      }
      break;
    }
    case "dots": {
      const gridSize = 4 + (nums[6] % 3);
      const dotSize = 2 + (nums[7] % 3);
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const idx = x * gridSize + y;
          if (nums[(8 + idx) % 32] % 3 === 0) {
            const px = round(15 + (x * 70) / (gridSize - 1));
            const py = round(15 + (y * 70) / (gridSize - 1));
            const offset = (nums[(12 + idx) % 32] % 10) - 5;
            const opacity = round(0.2 + (nums[(16 + idx) % 32] % 40) / 100);
            patternElements.push(
              <circle
                key={`dot-${x}-${y}`}
                cx={`${px + offset}%`}
                cy={`${py + offset}%`}
                r={`${dotSize}%`}
                fill={idx % 3 === 0 ? accent : "#ffffff"}
                opacity={opacity}
              />,
            );
          }
        }
      }
      break;
    }
    case "wireframe": {
      const vertices: { x: number; y: number }[] = [];
      const vertexCount = 7 + (nums[5] % 5);
      for (let i = 0; i < vertexCount; i++) {
        vertices.push({
          x: 10 + (nums[6 + i] % 80),
          y: 10 + (nums[12 + i] % 80),
        });
      }
      const edges: [number, number][] = [];
      for (let i = 0; i < vertices.length; i++) {
        const connections = 1 + (nums[18 + i] % 3);
        const distances = vertices
          .map((v, j) => ({
            j,
            dist: Math.abs(v.x - vertices[i].x) + Math.abs(v.y - vertices[i].y),
          }))
          .filter((d) => d.j !== i)
          .sort((a, b) => a.dist - b.dist);
        for (let c = 0; c < Math.min(connections, distances.length); c++) {
          const edge: [number, number] = [Math.min(i, distances[c].j), Math.max(i, distances[c].j)];
          if (!edges.some((e) => e[0] === edge[0] && e[1] === edge[1])) {
            edges.push(edge);
          }
        }
      }
      edges.forEach(([i, j], idx) => {
        const opacity = round(0.2 + (nums[(idx + 20) % 32] % 25) / 100);
        patternElements.push(
          <line
            key={`edge-${i}-${j}`}
            x1={`${vertices[i].x}%`}
            y1={`${vertices[i].y}%`}
            x2={`${vertices[j].x}%`}
            y2={`${vertices[j].y}%`}
            stroke={idx % 3 === 0 ? accent : "#ffffff"}
            strokeWidth={idx % 4 === 0 ? 1.5 : 1}
            opacity={opacity}
            strokeLinecap="round"
          />,
        );
      });
      vertices.forEach((v, i) => {
        const isHighlight = nums[24 + i] % 4 === 0;
        patternElements.push(
          <circle
            key={`vertex-glow-${i}`}
            cx={`${v.x}%`}
            cy={`${v.y}%`}
            r={isHighlight ? "4%" : "2.5%"}
            fill={isHighlight ? accent : "#ffffff"}
            opacity={0.3}
          />,
        );
        patternElements.push(
          <circle
            key={`vertex-${i}`}
            cx={`${v.x}%`}
            cy={`${v.y}%`}
            r={isHighlight ? "2%" : "1.5%"}
            fill={isHighlight ? accent : "#ffffff"}
            opacity={isHighlight ? 0.9 : 0.7}
          />,
        );
      });
      break;
    }
    case "mesh": {
      const meshPoints: { x: number; y: number }[] = [];
      for (let i = 0; i < 6; i++) {
        meshPoints.push({
          x: 10 + (nums[6 + i] % 80),
          y: 10 + (nums[12 + i] % 80),
        });
      }
      for (let i = 0; i < meshPoints.length; i++) {
        for (let j = i + 1; j < meshPoints.length; j++) {
          if (nums[(18 + i + j) % 32] % 3 !== 0) {
            const opacity = round(0.08 + (nums[(22 + i + j) % 32] % 15) / 100);
            patternElements.push(
              <line
                key={`mesh-${i}-${j}`}
                x1={`${meshPoints[i].x}%`}
                y1={`${meshPoints[i].y}%`}
                x2={`${meshPoints[j].x}%`}
                y2={`${meshPoints[j].y}%`}
                stroke="#ffffff"
                strokeWidth={1}
                opacity={opacity}
              />,
            );
          }
        }
      }
      meshPoints.forEach((point, i) => {
        patternElements.push(
          <circle
            key={`mesh-point-${i}`}
            cx={`${point.x}%`}
            cy={`${point.y}%`}
            r="2%"
            fill={i % 2 === 0 ? accent : "#ffffff"}
            opacity={0.4}
          />,
        );
      });
      break;
    }
    case "orbital": {
      const centerX = 50;
      const centerY = 50;
      for (let i = 0; i < complexity; i++) {
        const orbitRadius = 15 + i * 10;
        const orbitAngle = (nums[6 + i] % 360) * (Math.PI / 180);
        const planetX = round(centerX + Math.cos(orbitAngle) * orbitRadius);
        const planetY = round(centerY + Math.sin(orbitAngle) * orbitRadius);
        const planetSize = 3 + (nums[10 + i] % 5);
        patternElements.push(
          <circle
            key={`orbit-${i}`}
            cx={`${centerX}%`}
            cy={`${centerY}%`}
            r={`${orbitRadius}%`}
            fill="none"
            stroke="#ffffff"
            strokeWidth={0.5}
            opacity={0.15}
            strokeDasharray="2 4"
          />,
        );
        patternElements.push(
          <circle
            key={`planet-${i}`}
            cx={`${planetX}%`}
            cy={`${planetY}%`}
            r={`${planetSize}%`}
            fill={i % 2 === 0 ? accent : "#ffffff"}
            opacity={0.6}
          />,
        );
      }
      patternElements.push(
        <circle key="center-star" cx="50%" cy="50%" r="6%" fill={accent} opacity={0.8} />,
      );
      break;
    }
  }

  return {
    background: `${accentGradient}, ${radialGradient}, ${baseGradient}`,
    patternElements,
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
    return words[0].charAt(0).toUpperCase();
  }
  return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
}

interface UserAvatarProps {
  avatarSeed?: string;
  size?: number;
  className?: string;
  name?: string | null;
  animated?: boolean;
}

export function UserAvatar({
  avatarSeed,
  size = 80,
  className = "",
  name,
  animated = false,
}: UserAvatarProps) {
  const seed = avatarSeed || "default";
  const { background, patternElements } = generateAvatar(seed);
  const initials = name ? getInitials(name) : null;
  const fontSize = Math.max(12, Math.floor(size * 0.38));
  const nums = seedToNumbers(seed);
  const shimmerAngle = nums[28] % 360;

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full ${className}`}
      style={{ height: size, width: size, background }}
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <g className={animated ? "animate-[spin_60s_linear_infinite]" : ""}>{patternElements}</g>
      </svg>

      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        className="absolute inset-0 opacity-20"
        style={{
          background: `linear-gradient(${shimmerAngle}deg, transparent 20%, rgba(255,255,255,0.4) 50%, transparent 80%)`,
        }}
      />

      {initials && (
        <span
          className="relative z-10 font-black text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]"
          style={{ fontSize: `${fontSize}px`, letterSpacing: "0.02em" }}
        >
          {initials}
        </span>
      )}
    </div>
  );
}
