import type { PaymentMethod } from '@/data/mockData';

type Props = {
  brand: PaymentMethod['brand'];
  className?: string;
};

/**
 * Recognizable, minimalist card-brand marks — replaces the generic
 * CreditCard icon + plain-text pill used everywhere a card brand needs
 * to be shown (card list, add-card preview, PSP checkout).
 */
export function CardBrandMark({ brand, className = 'h-6 w-9' }: Props) {
  if (brand === 'VISA') {
    return (
      <svg viewBox="0 0 36 24" className={className} role="img" aria-label="Visa">
        <rect width="36" height="24" rx="4" fill="#1A1F71" />
        <text x="18" y="16.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="800" fontSize="11" fill="#fff" letterSpacing="0.5">
          VISA
        </text>
      </svg>
    );
  }
  if (brand === 'MASTERCARD') {
    return (
      <svg viewBox="0 0 36 24" className={className} role="img" aria-label="Mastercard">
        <rect width="36" height="24" rx="4" fill="#16171A" />
        <circle cx="15" cy="12" r="7" fill="#EB001B" />
        <circle cx="21" cy="12" r="7" fill="#F79E1B" />
        <path d="M18 6.5a7 7 0 0 1 0 11 7 7 0 0 1 0-11z" fill="#FF5F00" />
      </svg>
    );
  }
  // AMEX
  return (
    <svg viewBox="0 0 36 24" className={className} role="img" aria-label="American Express">
      <rect width="36" height="24" rx="4" fill="#2E77BC" />
      <text x="18" y="15.5" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="800" fontSize="8.5" fill="#fff" letterSpacing="0.2">
        AMEX
      </text>
    </svg>
  );
}

export function ApplePayMark({ className = 'h-6 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={className} role="img" aria-label="Apple Pay">
      <rect width="36" height="24" rx="4" fill="#000" />
      <path d="M12.6 8.9c-.4.5-1 .8-1.6.8-.1-.6.2-1.3.5-1.7.4-.5 1-.8 1.6-.9.1.7-.2 1.3-.5 1.8zm.5.9c-.9-.1-1.7.5-2.1.5-.4 0-1.1-.5-1.9-.5-1 0-1.9.6-2.4 1.5-1 1.7-.3 4.3.7 5.7.5.7 1.1 1.5 1.9 1.5.7 0 1-.5 1.9-.5s1.2.5 2 .5c.8 0 1.3-.7 1.8-1.4.6-.8.8-1.6.8-1.6s-1.6-.6-1.6-2.4c0-1.5 1.2-2.2 1.3-2.3-.7-1-1.8-1.1-2.2-1.1z" fill="#fff" />
      <text x="26" y="16" textAnchor="middle" fontFamily="-apple-system, Arial, sans-serif" fontWeight="600" fontSize="8.5" fill="#fff">Pay</text>
    </svg>
  );
}

export function GooglePayMark({ className = 'h-6 w-9' }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 24" className={className} role="img" aria-label="Google Pay">
      <rect width="36" height="24" rx="4" fill="#fff" stroke="#DADCE0" />
      <text x="10" y="15.5" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="7.5" fill="#5F6368">
        <tspan fill="#4285F4">G</tspan>
        <tspan fill="#EA4335">o</tspan>
        <tspan fill="#FBBC05">o</tspan>
        <tspan fill="#4285F4">g</tspan>
        <tspan fill="#34A853">l</tspan>
        <tspan fill="#EA4335">e</tspan>
      </text>
      <text x="24" y="15.5" fontFamily="Arial, sans-serif" fontWeight="600" fontSize="7.5" fill="#5F6368">Pay</text>
    </svg>
  );
}
