import Image from "next/image";

interface RecordingImageServerProps {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  sizes?: string;
  priority?: boolean;
}

export function RecordingImageServer({
  src,
  alt,
  className = "",
  imgClassName = "",
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw",
  priority = false,
}: RecordingImageServerProps) {
  return (
    <div className={`relative aspect-video w-full overflow-hidden ${className}`}>
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover transition-transform duration-500 ${imgClassName}`}
      />
    </div>
  );
}
