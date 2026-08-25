# VANTA — Global Money Movement Platform

Move Money. Anywhere.

VANTA is a global financial technology platform: international transfers, cross-border payments, FX, multi-currency balances, and global payouts — for consumers, businesses, and developers. Bilingual (English / Français).

## Stack

- Vite + React 18 + TypeScript
- Tailwind CSS (Geist / Geist Mono, teal design system)
- Hash-based SPA router, i18n via translation keys (`src/i18n/translations.ts`)

## Develop

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # outputs to dist/
```

## Deploy to Cloudflare Pages

1. Push this repository to GitHub (branch `main`).
2. In Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git → select `Vanta`.
3. Build settings:
   - Framework preset: **Vite**
   - Build command: `npm run build`
   - Build output directory: `dist`
4. Deploy. `public/_redirects` (SPA fallback) and `public/_headers` (security headers) are applied automatically.

Or with Wrangler CLI:

```bash
npm run build
npx wrangler pages deploy dist --project-name=vanta
```

## Connecting banks & PSPs (going live)

Vanta's front-end runs on a local data store (`src/data/store.ts`) so every flow works end-to-end in the demo. To move real money you plug licensed rails into the same functions. Recommended path for a Belgian-licensed EMI:

### 1. Banking rails (EUR/GBP/USD settlement)

- **Banking-as-a-Service partner** — open safeguarding + virtual IBAN accounts via a BaaS provider (e.g. ClearBank, Banking Circle, Railsr, Swan, or Modulr). They give you:
  - Dedicated virtual IBANs per user (`/balances` "account details")
  - SEPA / SEPA Instant, Faster Payments, SWIFT gpi connectivity
  - Webhooks for inbound credits → map them to `addMoney()` in `src/data/store.ts`
- **Direct scheme access** (later): become an indirect participant of SEPA via your sponsor bank under your Belgian NBB licence.

### 2. PSP / pay-in & pay-out partners

- **Pay-ins (top-ups, "Add money")**: Stripe, Adyen, or Checkout.com for cards + Apple Pay / Google Pay. Confirm the PaymentIntent server-side, then call `addMoney()`.
- **Pay-outs (Send flow)**: partner aggregators per corridor —
  - Africa mobile money: Onafriq, Thunes, Flutterwave, M-Pesa (Daraja API), MTN MoMo API, Wave, Orange Money
  - Asia/LatAm: Thunes, TerraPay, Nium
  - Bank payout: SWIFT via your BaaS partner
- Each payout partner call replaces the simulated delay in `executeSend()` (`src/pages/ConsumerDashboard.tsx`) and flips the transaction status via webhooks (`processing` → `completed`).

### 3. FX rates

- Live rates: exchangerate.host, Open Exchange Rates, or your liquidity provider (e.g. Currencycloud). Replace the static `fxRates` table in `src/data/mockData.ts` with a cached fetch (60 s refresh) and keep `getFxRate()` as the single read path so Converter, Send and Exchange stay consistent.

### 4. Compliance (mandatory before go-live)

- KYC/KYB: Sumsub, Onfido or Veriff — webhook result drives `submitKyc()` / approval in the admin queue.
- AML screening & transaction monitoring: ComplyAdvantage or Dow Jones + a rules engine on `addTransaction()`.
- Keep the NBB (Belgium) reporting obligations: safeguarding reconciliation, regulatory returns.

### 5. Wiring checklist

1. Create a thin `src/data/api.ts` gateway exposing the same signatures as `store.ts` (`createTransfer`, `addRecipient`, `addMoney`, `exchangeMoney`).
2. Point the UI at `api.ts` via a feature flag (`VITE_API_BASE_URL`).
3. Move `auth.ts` to real OIDC (Auth0, Keycloak) with MFA — keep `isSuperAdminEmail` server-side.
4. Add webhook endpoints (Cloudflare Workers / your backend) that credit balances and flip transaction statuses on PSP events.

Until these are wired, the app remains a fully functional simulation — no real funds move.

## Legal

Developed by Vanta. All rights reserved. UAE — Dubai.
