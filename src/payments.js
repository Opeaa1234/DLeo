// DLeo v0.2.0 payment-connectivity foundation.
// This module deliberately does NOT access banking apps, passwords, PINs, OTPs,
// card numbers, or device storage. It is a provider-neutral authorization layer.

export function createPaymentRequest({ amount, currency, merchant, description = "" }) {
  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error("Payment amount must be a positive number.");
  }

  if (!currency || typeof currency !== "string") {
    throw new Error("A currency is required.");
  }

  if (!merchant || typeof merchant !== "string") {
    throw new Error("A merchant identifier is required.");
  }

  return {
    id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    amount,
    currency: currency.toUpperCase(),
    merchant,
    description,
    status: "pending_authorization",
    createdAt: new Date().toISOString()
  };
}

export function authorizePayment(request, confirmation) {
  if (!request || request.status !== "pending_authorization") {
    throw new Error("Payment is not awaiting authorization.");
  }

  if (confirmation !== true) {
    return { ...request, status: "authorization_required" };
  }

  return {
    ...request,
    status: "authorized",
    authorizedAt: new Date().toISOString()
  };
}

export function revokePayment(request) {
  if (!request || ["settled", "revoked"].includes(request.status)) {
    throw new Error("Payment cannot be revoked in its current state.");
  }

  return {
    ...request,
    status: "revoked",
    revokedAt: new Date().toISOString()
  };
}
