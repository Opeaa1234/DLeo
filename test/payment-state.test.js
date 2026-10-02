import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { transitionPayment, allowedPaymentTransitions } from "../src/payment-state.js";

test("payment state machine permits the normal sandbox path", () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  const authorized = authorizePayment(request, true);
  const submitted = transitionPayment(authorized, "submitted");
  const simulated = transitionPayment(submitted, "simulated");

  assert.equal(authorized.status, "authorized");
  assert.equal(submitted.status, "submitted");
  assert.equal(simulated.status, "simulated");
  assert.ok(simulated.updatedAt);
});

test("state machine blocks an invalid jump", () => {
  const request = createPaymentRequest({ amount: 5000, currency: "NGN", merchant: "sandbox-merchant" });
  assert.throws(
    () => transitionPayment(request, "accepted"),
    /Invalid payment transition/
  );
});

test("terminal states cannot transition further", () => {
  assert.deepEqual(allowedPaymentTransitions("simulated"), []);
  assert.deepEqual(allowedPaymentTransitions("accepted"), []);
  assert.deepEqual(allowedPaymentTransitions("rejected"), []);
});
