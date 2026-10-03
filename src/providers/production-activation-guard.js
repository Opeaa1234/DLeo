// Fail-closed production activation guard.
// This module never creates or stores credentials. It only validates explicit
// runtime preconditions before a separately reviewed production provider can run.
// The raw secret is intentionally never returned by this guard.

export function assertProductionActivation({
  environment = process.env.NODE_ENV,
  approval = process.env.DLEO_PRODUCTION_ACTIVATION_APPROVED,
  secretKey,
  recipientCode,
  maxAmount,
  auditEnabled = false,
  monitoringEnabled = false,
  rollbackEnabled = false
} = {}) {
  if (environment !== "production") {
    throw new Error("Production activation requires NODE_ENV=production.");
  }

  if (approval !== "true") {
    throw new Error("Production activation requires explicit operator approval.");
  }

  if (typeof secretKey !== "string" || secretKey.length === 0) {
    throw new Error("A production secret key must be supplied at runtime.");
  }

  if (!secretKey.startsWith("sk_live_")) {
    throw new Error("Production activation requires a production Paystack secret key.");
  }

  if (typeof recipientCode !== "string" || recipientCode.length === 0) {
    throw new Error("A production recipient code is required.");
  }

  if (!Number.isInteger(maxAmount) || maxAmount <= 0) {
    throw new Error("A positive production transaction limit is required.");
  }

  if (auditEnabled !== true) {
    throw new Error("Production activation requires audit logging to be enabled.");
  }

  if (monitoringEnabled !== true) {
    throw new Error("Production activation requires monitoring to be enabled.");
  }

  if (rollbackEnabled !== true) {
    throw new Error("Production activation requires a tested rollback/disable path.");
  }

  return Object.freeze({
    environment: "production",
    approved: true,
    recipientCode,
    maxAmount,
    auditEnabled: true,
    monitoringEnabled: true,
    rollbackEnabled: true
  });
}
