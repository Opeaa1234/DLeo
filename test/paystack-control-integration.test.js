import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { createPaystackTransferProvider } from "../src/providers/paystack-transfer.js";
import { createTransferIdempotency } from "../src/providers/transfer-idempotency.js";
import { createTransferReliability } from "../src/providers/transfer-reliability.js";
import { createTransferAudit } from "../src/providers/transfer-audit.js";

function authorizedPayment(id = "integration-1") {
  return authorizePayment({
    ...createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "test-recipient" }),
    id
  }, true);
}

test("Paystack adapter uses idempotency and audit controls around the provider request", async () => {
  let calls = 0;
  const events = [];
  const fetchImpl = async () => {
    calls += 1;
    return {
      ok: true,
      status: 200,
      async json() {
        return { status: true, data: { status: "pending", reference: "integration-1" } };
      }
    };
  };

  const provider = createPaystackTransferProvider({
    secretKey: "test-secret-not-real",
    recipientCode: "RCP_TEST",
    fetchImpl,
    idempotency: createTransferIdempotency(),
    reliability: createTransferReliability({ fetchImpl, sleep: async () => {} }),
    audit: createTransferAudit({ sink: event => events.push(event) })
  });

  const payment = authorizedPayment();
  const first = await provider.charge(payment);
  const second = await provider.charge(payment);

  assert.deepEqual(second, first);
  assert.equal(calls, 1);
  assert.deepEqual(events.map(event => event.outcome), ["success", "duplicate"]);
});

test("Paystack adapter records an ambiguous timeout without parsing it as a provider result", async () => {
  const events = [];
  const fetchImpl = async () => {
    const error = new Error("network unavailable");
    error.name = "AbortError";
    throw error;
  };

  const provider = createPaystackTransferProvider({
    secretKey: "test-secret-not-real",
    recipientCode: "RCP_TEST",
    fetchImpl,
    idempotency: createTransferIdempotency(),
    reliability: createTransferReliability({ fetchImpl, sleep: async () => {} }),
    audit: createTransferAudit({ sink: event => events.push(event) })
  });

  const result = await provider.charge(authorizedPayment("integration-2"));

  assert.equal(result.outcome, "ambiguous_timeout");
  assert.equal(events.at(-1).outcome, "ambiguous_timeout");
});
