// Paystack transfer adapter.
// No credentials are stored in this repository. Keep PAYSTACK_SECRET_KEY in a
// server-side secret store/environment variable and never commit it to Git.
// This adapter is intended for a pre-registered recipient, not arbitrary websites.

const PAYSTACK_API_URL = "https://api.paystack.co";

export function createPaystackTransferProvider({ secretKey, recipientCode, fetchImpl = fetch } = {}) {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required at runtime and must not be committed to Git.");
  }
  if (!recipientCode) {
    throw new Error("A pre-registered Paystack recipient code is required.");
  }

  return {
    async charge(paymentRequest) {
      if (!paymentRequest || paymentRequest.status !== "authorized") {
        throw new Error("Only an authorized payment can be submitted.");
      }

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
