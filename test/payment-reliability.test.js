import test from "node:test";
import assert from "node:assert/strict";
import { withRetry } from "../src/payment-reliability.js";
import { createPaymentRequest } from "../src/payments.js";
import { createAuditLog } from "../src/payment-audit.js";
import { runSandboxPayment } from "../src/payment-flow.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";
import { createIdempotencyStore } from "../src/payment-idempotency.js";

test("bounded retry retries only transient failures", async () => {
  let attempts = 0;
  const result = await withRetry(async () => {
    attempts += 1;
    if (attempts < 3) {
      const error = new Error("temporary sandbox outage");
      error.retryable = true;
      throw error;
    }
    return "ok";
  }, { maxAttempts: 3, delayMs: 0 });

  assert.equal(result, "ok");
  assert.equal(attempts, 3);
});

test("non-retryable failure is rejected and audited", async () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  const auditLog = createAuditLog();
  const store = createIdempotencyStore();
  const provider = {
    name: "test-provider",
    async charge() {
      throw new Error("permanent sandbox failure");
    }
  };

  const result = await runSandboxPayment(request, provider, auditLog, true, store);

  assert.equal(result.status, "rejected");
  assert.equal(auditLog.list().at(-1).action, "payment.failed");
  assert.equal(store.get(`${request.id}:5000:NGN:sandbox-merchant:`).status, "rejected");
});

test("successful sandbox flow remains successful with retry layer", async () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  const auditLog = createAuditLog();
  const provider = createSandboxProvider();
  const store = createIdempotencyStore();

  const result = await runSandboxPayment(request, provider, auditLog, true, store, { maxAttempts: 3, delayMs: 0 });

  assert.equal(result.status, "simulated");
  assert.equal(auditLog.list().at(-1).action, "payment.sandbox_simulated");
});
