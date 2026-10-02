// Paystack transfer adapter (test/live selection is controlled by the supplied API key).
// No credentials are stored in this repository. Keep PAYSTACK_SECRET_KEY in a
// server-side secret store/environment variable and never commit it to Git.

const PAYSTACK_API_URL = "https://api.paystack.co";

export function createPaystackTransferProvider({ secretKey, fetchImpl = fetch } = {}) {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required at runtime and must not be committed to Git.");
  }

  return {
    async charge(paymentRequest) {
      if (!paymentRequest || paymentRequest.status !== "authorized") {
        throw new Error("Only an authorized payment can be submitted.");
      }

      const recipient = paymentRequest.recipientCode;
      if (!recipient) {
        throw new Error("A pre-registered transfer recipient is required.");
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
          recipient,
          reference: paymentRequest.reference,
          reason: paymentRequest.merchant
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
