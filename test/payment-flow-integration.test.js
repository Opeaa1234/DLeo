import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest } from "../src/payments.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";
import { createAuditLog } from "../src/payment-audit.js";
import { runSandboxPayment } from "../src/payment-flow.js";

test("integrated sandbox flow transitions and audits the payment", async () => {
  const request = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "sandbox-merchant"
  });
  const auditLog = createAuditLog();
  const provider = createSandboxProvider();

  const result = await runSandboxPayment(request, provider, auditLog, true);

  assert.equal(result.status, "simulated");
  assert.equal(result.id, request.id);
  assert.deepEqual(
    auditLog.list().map((event) => event.action),
    ["payment.authorized", "payment.submitted", "payment.sandbox_simulated"]
  );
});

test("integrated flow stops before submission without confirmation", async () => {
  const request = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "sandbox-merchant"
  });
  const auditLog = createAuditLog();
  const provider = createSandboxProvider();

  const result = await runSandboxPayment(request, provider, auditLog, false);

  assert.equal(result.status, "authorization_required");
  assert.deepEqual(auditLog.list().map((event) => event.action), ["payment.authorized"]);
});
