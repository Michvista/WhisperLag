import { LOGO_URL } from "@/lib/brand";

/**
 * The Whisper Lock signature mark (from the Stitch design). Rendered with a
 * multiply blend so the transparent PNG sits naturally on any surface.
 * Uses a plain <img> so no image-optimizer/domain config is required.
 */
export function WhisperLogo({ size = 128, className = "" }: { size?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={LOGO_URL}
      alt="Whisper Lock — secure and anonymous"
      width={size}
      height={size}
      className={`h-auto w-auto object-contain mix-blend-multiply ${className}`}
    />
  );
}