import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { createAuditEvent, createAuditLog } from "../src/payment-audit.js";

test("audit log records an authorized payment event", () => {
  const request = authorizePayment(
    createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "example" }),
    true
  );
  const event = createAuditEvent({
    request,
    action: "payment.authorized",
    outcome: "success",
    detail: "Explicit user authorization"
  });
  const log = createAuditLog();
  log.append(event);

  const entries = log.list();
  assert.equal(entries.length, 1);
  assert.equal(entries[0].paymentId, request.id);
  assert.equal(entries[0].outcome, "success");
  assert.ok(entries[0].timestamp);
});

test("audit log returns copies and cannot be mutated through list output", () => {
  const request = createPaymentRequest({ amount: 1000, currency: "NGN", merchant: "example" });
  const event = createAuditEvent({ request, action: "payment.created", outcome: "success" });
  const log = createAuditLog();
  log.append(event);

  const entries = log.list();
  entries[0].outcome = "tampered";
  assert.equal(log.list()[0].outcome, "success");
});
