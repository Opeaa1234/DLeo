// Paystack transfer adapter.
// No credentials are stored in this repository. Keep PAYSTACK_SECRET_KEY in a
// server-side secret store/environment variable and never commit it to Git.
// This adapter is intended for a pre-registered recipient, not arbitrary websites.
// Paystack amounts are provider subunits: NGN uses kobo, GHS uses pesewas.

import { validatePaymentPolicy } from "../payment-policy.js";

const PAYSTACK_API_URL = "https://api.paystack.co";

export function createPaystackTransferProvider({
  secretKey,
  recipientCode,
  fetchImpl = fetch,
  maxAmount = 100000,
  allowLive = false
} = {}) {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required at runtime and must not be committed to Git.");
  }
  if (!recipientCode) {
    throw new Error("A pre-registered Paystack recipient code is required.");
  }

  // Prevent accidental use of a live key while this adapter is being developed.
  // Live transfers must be an explicit, separately reviewed decision.
  if (secretKey.startsWith("sk_live_") && allowLive !== true) {
    throw new Error("Live Paystack transfers are disabled until explicitly enabled.");
  }

  return {
    async charge(paymentRequest) {
      validatePaymentPolicy(paymentRequest, { maxAmount });

      const response = await fetchImpl(`${PAYSTACK_API_URL}/transfer`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          source: "balance",
          amount: paymentRequest.amount,
          recipient: recipientCode,
          reference: paymentRequest.id,
          reason: paymentRequest.merchant,
          currency: paymentRequest.currency
        })
      });

      const data = await response.json();
      if (!response.ok || data.status !== true) {
        throw new Error(data.message || "Paystack transfer request failed.");
      }

      return data.data;
    }
  };
}
