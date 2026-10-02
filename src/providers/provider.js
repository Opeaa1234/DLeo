// Interface for an authorized external payment provider.
// This module intentionally contains no provider credentials and makes no network calls.

export function createProviderAdapter(provider) {
  if (!provider || typeof provider.charge !== "function") {
    throw new TypeError("Provider must expose an async charge(paymentRequest) function.");
  }

  return {
    async charge(paymentRequest) {
      if (!paymentRequest || paymentRequest.status !== "authorized") {
        throw new Error("Only an authorized payment can be submitted.");
      }
      return provider.charge(paymentRequest);
    }
  };
}
