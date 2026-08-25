export function BelgianFlag({ className = 'w-6 h-4' }: { className?: string }) {
  return (
    <span className={`inline-flex overflow-hidden rounded-[3px] border border-ink-200/60 ${className}`} role="img" aria-label="Belgium flag">
      <span className="flex-1 bg-black" />
      <span className="flex-1 bg-[#FDD835]" />
      <span className="flex-1 bg-[#E53935]" />
    </span>
  );
}
