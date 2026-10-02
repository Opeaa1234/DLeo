import test from "node:test";
import assert from "node:assert/strict";
import { createProviderAdapter } from "../src/providers/provider.js";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";

test("provider adapter forwards an explicitly authorized payment", async () => {
  const calls = [];
  const adapter = createProviderAdapter({
    async charge(request) {
      calls.push(request);
      return { status: "accepted", paymentId: request.id };
    }
  });

  const request = authorizePayment(
    createPaymentRequest({ amount: 100, currency: "NGN", merchant: "example" }),
    true
  );

  const result = await adapter.charge(request);
  assert.equal(result.status, "accepted");
  assert.equal(calls.length, 1);
});

test("provider adapter blocks an unauthorised payment", async () => {
  const adapter = createProviderAdapter({
    async charge() {
      throw new Error("should not be called");
    }
  });

  const request = createPaymentRequest({ amount: 100, currency: "NGN", merchant: "example" });
  await assert.rejects(() => adapter.charge(request), /authorized payment/);
});
