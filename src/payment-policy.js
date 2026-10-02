// Safety policy applied before an external payment provider is called.
// This policy is provider-neutral and does not contain credentials.

export function validatePaymentPolicy(request, { maxAmount = 100000 } = {}) {
  if (!request || request.status !== "authorized") {
    throw new Error("Only an authorized payment can pass the payment policy.");
  }

  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    throw new Error("Payment amount must be positive.");
  }

  if (request.amount > maxAmount) {
    throw new Error("Payment exceeds the configured maximum amount.");
  }

  if (!request.merchant || typeof request.merchant !== "string") {
    throw new Error("A merchant identifier is required.");
  }

  return true;
}
