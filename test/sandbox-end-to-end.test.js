import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest } from "../src/payments.js";
import { createAuditLog } from "../src/payment-audit.js";
import { createIdempotencyStore } from "../src/payment-idempotency.js";
import { runSandboxPayment } from "../src/payment-flow.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";

test("final sandbox checkpoint covers authorization, audit, idempotency, and recovery", async () => {
  const request = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "sandbox-merchant",
    description: "end-to-end verification"
  });
  const auditLog = createAuditLog();
  const idempotencyStore = createIdempotencyStore();
  const provider = createSandboxProvider();
  let attempts = 0;

  const recoveringProvider = {
    name: provider.name,
    async charge(payment) {
      attempts += 1;
      if (attempts === 1) {
        await new Promise((resolve) => setTimeout(resolve, 20));
      }
      return provider.charge(payment);
    }
  };

  const first = await runSandboxPayment(
    request,
    recoveringProvider,
    auditLog,
    true,
    idempotencyStore,
    { maxAttempts: 2, delayMs: 0, timeoutMs: 5 }
  );

  assert.equal(first.status, "simulated");
  assert.equal(attempts, 2);
  assert.equal(idempotencyStore.has(`payment:${request.id}`), true);

  const replay = await runSandboxPayment(
    request,
    recoveringProvider,
    auditLog,
    true,
    idempotencyStore,
    { maxAttempts: 2, delayMs: 0, timeoutMs: 5 }
  );

  assert.equal(replay.id, first.id);
  assert.equal(replay.status, "simulated");
  assert.equal(attempts, 2);

  assert.deepEqual(
    auditLog.list().map((event) => event.action),
    [
      "payment.authorized",
      "payment.submitted",
      "payment.sandbox_simulated",
      "payment.idempotency_replay"
    ]
  );
});
