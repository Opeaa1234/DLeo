// Local payment-provider sandbox for development and tests.
// This module never contacts a bank, card network, or external service.

import { transitionPayment } from "../payment-state.js";

export function createSandboxProvider() {
  return {
    name: "dleo-local-sandbox",
    async charge(paymentRequest) {
      if (!paymentRequest || paymentRequest.status !== "submitted") {
        throw new Error("Only a submitted payment can be sent to the sandbox.");
      }

      const simulated = transitionPayment(paymentRequest, "simulated");

      return {
        provider: "dleo-local-sandbox",
        payment: simulated,
        paymentId: simulated.id,
        status: simulated.status,
        amount: simulated.amount,
        currency: simulated.currency,
        merchant: simulated.merchant,
        simulatedAt: simulated.updatedAt
      };
    }
  };
}
