// Local payment-provider sandbox for development and tests.
// This module never contacts a bank, card network, or external service.

export function createSandboxProvider() {
  return {
    name: "dleo-local-sandbox",
    async charge(paymentRequest) {
      if (!paymentRequest || paymentRequest.status !== "authorized") {
        throw new Error("Only an authorized payment can be sent to the sandbox.");
      }

      return {
        provider: "dleo-local-sandbox",
        paymentId: paymentRequest.id,
        status: "simulated",
        amount: paymentRequest.amount,
        currency: paymentRequest.currency,
        merchant: paymentRequest.merchant,
        simulatedAt: new Date().toISOString()
      };
    }
  };
}
