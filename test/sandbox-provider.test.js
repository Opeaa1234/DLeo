import test from "node:test";
import assert from "node:assert/strict";
import { authorizePayment, createPaymentRequest } from "../src/payments.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";

test("sandbox simulates an authorized payment without moving money", async () => {
  const request = authorizePayment(
    createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" }),
    true
  );

  const result = await createSandboxProvider().charge(request);

  assert.equal(result.status, "simulated");
  assert.equal(result.provider, "dleo-local-sandbox");
  assert.equal(result.amount, 10);
  assert.equal(result.currency, "NGN");
});

test("sandbox rejects payments that were not authorized", async () => {
  const request = createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" });

  await assert.rejects(
    () => createSandboxProvider().charge(request),
    /authorized payment/
  );
});
