export function BrandMark({ className = "h-4 w-4" }: { className?: string }) {
  // Custom enterprise mark — concentric squares, no vendor lookalikes.
  return (
    <svg
      viewBox="0 0 16 16"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      aria-hidden="true"
    >
      <rect x="1.5" y="1.5" width="13" height="13" rx="1.5" />
      <rect x="5" y="5" width="6" height="6" rx="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}
