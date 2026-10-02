import test from "node:test";
import assert from "node:assert/strict";
import { authorizePayment, createPaymentRequest, revokePayment } from "../src/payments.js";

test("creates a payment request without contacting a bank", () => {
  const request = createPaymentRequest({
    amount: 10,
    currency: "NGN",
    merchant: "example-merchant",
    description: "Test payment"
  });

  assert.equal(request.amount, 10);
  assert.equal(request.currency, "NGN");
  assert.equal(request.status, "pending_authorization");
});

test("requires explicit confirmation before authorization", () => {
  const request = createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" });
  assert.equal(authorizePayment(request, false).status, "authorization_required");
  assert.equal(authorizePayment(request, true).status, "authorized");
});

test("can revoke an authorized request", () => {
  const request = authorizePayment(
    createPaymentRequest({ amount: 10, currency: "NGN", merchant: "example" }),
    true
  );

  assert.equal(revokePayment(request).status, "revoked");
});
