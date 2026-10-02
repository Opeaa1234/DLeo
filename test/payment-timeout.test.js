import test from "node:test";
import assert from "node:assert/strict";
import { withTimeout } from "../src/payment-timeout.js";
import { createPaymentRequest } from "../src/payments.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";
import { createAuditLog } from "../src/payment-audit.js";
import { runSandboxPayment } from "../src/payment-flow.js";
import { createIdempotencyStore } from "../src/payment-idempotency.js";

test("timeout creates a retryable provider-timeout error", async () => {
  await assert.rejects(
    () => withTimeout(() => new Promise(() => {}), 5),
    (error) => error.code === "PROVIDER_TIMEOUT" && error.retryable === true
  );
});

test("sandbox flow recovers from a transient provider timeout", async () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  const auditLog = createAuditLog();
  const store = createIdempotencyStore();
  let calls = 0;
  const sandbox = createSandboxProvider();
  const provider = {
    name: sandbox.name,
    async charge(payment) {
      calls += 1;
      if (calls === 1) await new Promise(() => {});
      return sandbox.charge(payment);
    }
  };

  const result = await runSandboxPayment(
    request,
    provider,
    auditLog,
    true,
    store,
    { maxAttempts: 2, timeoutMs: 5, delayMs: 0 }
  );

  assert.equal(result.status, "simulated");
  assert.equal(calls, 2);
});
