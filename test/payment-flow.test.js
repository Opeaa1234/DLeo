import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";
import { createAuditEvent, createAuditLog } from "../src/payment-audit.js";

test("end-to-end sandbox payment flow records the simulation", async () => {
  const request = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "sandbox-merchant",
    description: "DLeo integration test"
  });

  const authorized = authorizePayment(request, true);
  const provider = createSandboxProvider();
  const result = await provider.charge(authorized);

  const audit = createAuditLog();
  audit.append(createAuditEvent({
    request: authorized,
    action: "payment.authorized",
    outcome: "success"
  }));
  audit.append(createAuditEvent({
    request: authorized,
    action: "payment.sandbox_simulated",
    outcome: result.status,
    provider: result.provider
  }));

  assert.equal(result.status, "simulated");
  assert.equal(result.paymentId, request.id);
  assert.equal(result.amount, 5000);
  assert.equal(audit.list().length, 2);
  assert.equal(audit.list()[1].outcome, "simulated");
});

test("sandbox rejects a payment that was not authorized", async () => {
  const request = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "sandbox-merchant"
  });

  const provider = createSandboxProvider();
  await assert.rejects(
    () => provider.charge(request),
    /authorized payment/
  );
});
