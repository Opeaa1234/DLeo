import test from "node:test";
import assert from "node:assert/strict";
import { authorizePayment, createPaymentRequest } from "../src/payments.js";
import { transitionPayment } from "../src/payment-state.js";
import { createSandboxProvider } from "../src/providers/sandbox.js";

test("sandbox simulates a submitted authorized payment without moving money", async () => {
  const authorized = authorizePayment(
    createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" }),
    true
  );
  const submitted = transitionPayment(authorized, "submitted");

  const result = await createSandboxProvider().charge(submitted);

  assert.equal(result.status, "simulated");
  assert.equal(result.provider, "dleo-local-sandbox");
  assert.equal(result.amount, 10);
  assert.equal(result.currency, "NGN");
  assert.equal(result.payment.status, "simulated");
});

test("sandbox rejects payments that were not authorized", async () => {
  const request = createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" });

  await assert.rejects(
    () => createSandboxProvider().charge(request),
    /submitted payment/
  );
});

test("sandbox rejects an authorized payment that was not submitted", async () => {
  const authorized = authorizePayment(
    createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" }),
    true
  );

  await assert.rejects(
    () => createSandboxProvider().charge(authorized),
    /submitted payment/
  );
});
