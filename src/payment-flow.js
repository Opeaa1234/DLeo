import { authorizePayment } from "./payments.js";
import { transitionPayment } from "./payment-state.js";
import { createAuditEvent } from "./payment-audit.js";
import { paymentIdempotencyKey } from "./payment-idempotency.js";

export async function runSandboxPayment(request, provider, auditLog, confirmation = true, idempotencyStore = null) {
  const key = paymentIdempotencyKey(request);
  const previous = idempotencyStore?.get(key);
  if (previous) {
    auditLog.append(createAuditEvent({
      request: previous,
      action: "payment.idempotency_replay",
      outcome: "reused",
      provider: provider.name
    }));
    return previous;
  }

  const authorized = authorizePayment(request, confirmation);
  auditLog.append(createAuditEvent({
    request: authorized,
    action: "payment.authorized",
    outcome: authorized.status === "authorized" ? "success" : "authorization_required"
  }));

  if (authorized.status !== "authorized") return authorized;

  const submitted = transitionPayment(authorized, "submitted");
  auditLog.append(createAuditEvent({
    request: submitted,
    action: "payment.submitted",
    outcome: "success",
    provider: provider.name
  }));

  const result = await provider.charge(submitted);
  const finalPayment = result.payment;
  idempotencyStore?.set(key, finalPayment);

  auditLog.append(createAuditEvent({
    request: finalPayment,
    action: "payment.sandbox_simulated",
    outcome: result.status,
    provider: result.provider
  }));

  return finalPayment;
}
