import { loadStripe, type Stripe } from '@stripe/stripe-js';

// Stripe PUBLISHABLE key (pk_...) — safe to embed client-side, this is the
// one Stripe key that's meant to be public. The SECRET key never goes here;
// it lives only in the create-payment-intent / stripe-webhook Edge Function
// secrets on Supabase.
const STRIPE_PUBLISHABLE_KEY = '';

let stripePromise: Promise<Stripe | null> | null = null;

export function getStripe(): Promise<Stripe | null> {
  if (!STRIPE_PUBLISHABLE_KEY) return Promise.resolve(null);
  if (!stripePromise) stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
  return stripePromise;
}

export const isStripeConfigured = () => Boolean(STRIPE_PUBLISHABLE_KEY);
