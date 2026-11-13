import Image from "next/image";

import { getInitials } from "@/lib/utils/initials";

// The buttons of the Bonfire symbol, the same frames the social images use:
// The pointed-down one for a person, the wide one for a group photo.
const FRAMES = {
  person: {
    aspect: "aspect-[200.63/269.83]",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 200.63 269.83' preserveAspectRatio='none'><path transform='translate(-233.17 708.84) scale(1 -1)' d='M233.17 531.71c0-9.63 3.73-17.91 10.92-24.3l67.85-60.18c12.36-10.96 30.74-10.96 43.1 0l67.84 60.18c7.2 6.39 10.92 14.67 10.92 24.3v79.49c0 53.78-43.86 97.64-97.63 97.64h-5.36c-53.78 0-97.64-43.86-97.64-97.64v-79.49z'/></svg>",
  },
  group: {
    aspect: "aspect-[269.84/200.63]",
    svg: "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 275.04 269.84 200.63' preserveAspectRatio='none'><path d='M177.14 275.04c9.62 0 17.9 3.73 24.29 10.92l60.18 67.85c10.97 12.36 10.97 30.74 0 43.1l-60.18 67.84c-6.39 7.2-14.67 10.92-24.29 10.92h-79.5C43.86 475.67 0 431.81 0 378.04v-5.36c0-53.78 43.86-97.64 97.64-97.64h79.5z'/></svg>",
  },
} as const;

function maskStyle(svg: string) {
  const image = `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
  return {
    WebkitMaskImage: image,
    WebkitMaskSize: "100% 100%",
    maskImage: image,
    maskSize: "100% 100%",
  } as const;
}

interface SpeakerPhotoProps {
  className?: string;
  initialsClassName?: string;
  kind?: keyof typeof FRAMES;
  name: string;
  photoUrl?: string;
  priority?: boolean;
  sizes: string;
}

export function SpeakerPhoto({
  className = "",
  initialsClassName = "text-5xl",
  kind = "person",
  name,
  photoUrl,
  priority = false,
  sizes,
}: SpeakerPhotoProps) {
  return (
    <div
      className={`relative bg-gradient-to-br from-orange-500 to-rose-600 ${FRAMES[kind].aspect} ${className}`}
      style={maskStyle(FRAMES[kind].svg)}
    >
      {photoUrl ? (
        <Image
          src={photoUrl}
          alt={name}
          fill
          priority={priority}
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <span
          className={`absolute inset-0 flex items-center justify-center font-black text-white ${kind === "person" ? "pb-[12%]" : "pr-[10%]"} ${initialsClassName}`}
        >
          {getInitials(name)}
        </span>
      )}
    </div>
  );
}
