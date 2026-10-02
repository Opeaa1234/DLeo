import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest } from "../src/payments.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";
import { createAuditLog } from "../src/payment-audit.js";
import { runSandboxPayment } from "../src/payment-flow.js";
import { createIdempotencyStore, paymentIdempotencyKey } from "../src/payment-idempotency.js";

test("replaying the same payment request reuses the sandbox result", async () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  const auditLog = createAuditLog();
  const provider = createSandboxProvider();
  const store = createIdempotencyStore();

  const first = await runSandboxPayment(request, provider, auditLog, true, store);
  const second = await runSandboxPayment(request, provider, auditLog, true, store);

  assert.equal(second.id, first.id);
  assert.equal(second.status, "simulated");
  assert.equal(store.has(paymentIdempotencyKey(request)), true);
  assert.deepEqual(
    auditLog.list().map((event) => event.action),
    ["payment.authorized", "payment.submitted", "payment.sandbox_simulated", "payment.idempotency_replay"]
  );
});

test("idempotency keys are required by the store", () => {
  const store = createIdempotencyStore();
  assert.throws(() => store.set("", { status: "simulated" }), /idempotency key is required/);
});
