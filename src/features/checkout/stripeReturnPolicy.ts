// Classifies where the hosted Stripe Checkout page redirects once the user
// finishes (or abandons) payment. Stripe stays on `*.stripe.com`; when it
// redirects back to the storefront/checkout backend (`success_url` /
// `cancel_url` configured server-side), we hand control back to the app.

export type StripeReturnKind = 'stripe' | 'success' | 'cancel' | 'other';

const STRIPE_HOST_SUFFIXES = ['stripe.com', 'stripe.network'] as const;

function hostOf(url: string): string | null {
  try {
    return new URL(url).host.toLowerCase();
  } catch {
    return null;
  }
}

export function isStripeHost(host: string): boolean {
  return STRIPE_HOST_SUFFIXES.some(s => host === s || host.endsWith(`.${s}`));
}

/**
 * Classify a top-level navigation seen inside the card-payment WebView.
 * - `stripe`  : still on the Stripe Checkout page (keep rendering).
 * - `success` : payment completed; return to native OrderSuccess.
 * - `cancel`  : payment abandoned/cancelled; return to checkout.
 * - `other`   : unrecognised (let it load; logged for diagnosis).
 */
export function classifyStripeReturn(url: string): StripeReturnKind {
  const host = hostOf(url);
  if (host && isStripeHost(host)) return 'stripe';

  const lowered = url.toLowerCase();
  // Cancel patterns take priority over generic "checkout" matches so that a
  // cancel_url pointing back at the checkout page is not misread as success.
  if (/(cancel|fail|failure|declin|abort)/.test(lowered)) return 'cancel';
  if (/(success|complete|completed|thank|paid|confirm|order[_-]?success)/.test(lowered)) {
    return 'success';
  }
  return 'other';
}
