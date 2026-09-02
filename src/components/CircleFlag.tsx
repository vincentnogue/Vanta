type Props = {
  countryCode: string;
  size?: number;
  className?: string;
};

/** Real circular SVG flag (hatscripts/circle-flags), with a graceful
 * fallback to colored initials if a code is missing — never a broken image. */
export function CircleFlag({ countryCode, size = 20, className = '' }: Props) {
  return (
    <span
      className={`inline-flex rounded-full overflow-hidden ring-1 ring-ink-200/70 shrink-0 bg-ink-50 ${className}`}
      style={{ width: size, height: size }}
    >
      <img
        src={`https://hatscripts.github.io/circle-flags/flags/${countryCode.toLowerCase()}.svg`}
        alt={countryCode}
        className="w-full h-full object-cover"
        loading="lazy"
        width={size}
        height={size}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
          const fallback = e.currentTarget.nextElementSibling as HTMLElement | null;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <span
        className="hidden w-full h-full items-center justify-center bg-vanta-100 text-vanta-700 font-bold"
        style={{ fontSize: size * 0.32 }}
      >
        {countryCode}
      </span>
    </span>
  );
}
