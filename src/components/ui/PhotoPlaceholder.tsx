import { clsx } from "clsx";

interface PhotoPlaceholderProps {
  label: string;
  aspectRatio?: "video" | "square" | "banner";
  className?: string;
}

export function PhotoPlaceholder({
  label,
  aspectRatio = "video",
  className,
}: PhotoPlaceholderProps) {
  const ratioClass = {
    video: "aspect-video",
    square: "aspect-square",
    banner: "aspect-[3/1]",
  }[aspectRatio];

  return (
    <div
      role="img"
      aria-label={label}
      className={clsx(
        "w-full flex flex-col items-center justify-center gap-2",
        "bg-[var(--surface)] border-2 border-dashed border-[var(--border)]",
        "rounded-[var(--r-md)] text-[var(--muted)]",
        ratioClass,
        className
      )}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
      </svg>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
