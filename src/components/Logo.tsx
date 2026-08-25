export function Logo({ dark = false, size = 'md' }: { dark?: boolean; size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: { box: 'w-7 h-7', text: 'text-lg' },
    md: { box: 'w-8 h-8', text: 'text-xl' },
    lg: { box: 'w-10 h-10', text: 'text-2xl' },
  };
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2.5">
      <img src="/logo.svg" alt="VANTA logo" className={`${s.box} ${dark ? 'invert' : ''}`} />
      <span className={`font-display font-bold tracking-tight ${s.text} ${dark ? 'text-white' : 'text-black'}`}>
        VANTA
      </span>
    </div>
  );
}
