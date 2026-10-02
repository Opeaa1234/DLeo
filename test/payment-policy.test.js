import test from "node:test";
import assert from "node:assert/strict";
import { validatePaymentPolicy } from "../src/payment-policy.js";

test("payment policy accepts an authorized payment within the limit", () => {
  assert.equal(
    validatePaymentPolicy(
      { status: "authorized", amount: 5000, merchant: "example" },
      { maxAmount: 10000 }
    ),
    true
  );
});

test("payment policy rejects an unauthorized payment", () => {
  assert.throws(
    () => validatePaymentPolicy({ status: "pending_authorization", amount: 5000, merchant: "example" }),
    /authorized payment/
  );
});

test("payment policy rejects an amount above the configured limit", () => {
  assert.throws(
    () => validatePaymentPolicy({ status: "authorized", amount: 10001, merchant: "example" }, { maxAmount: 10000 }),
    /maximum amount/
  );
});
