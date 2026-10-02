import { authorizePayment } from "./payments.js";
import { transitionPayment } from "./payment-state.js";
import { createAuditEvent } from "./payment-audit.js";

export async function runSandboxPayment(request, provider, auditLog, confirmation = true) {
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
  auditLog.append(createAuditEvent({
    request: result.payment,
    action: "payment.sandbox_simulated",
    outcome: result.status,
    provider: result.provider
  }));

  return result.payment;
}
