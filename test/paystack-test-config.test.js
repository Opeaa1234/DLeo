import test from "node:test";
import assert from "node:assert/strict";
import { createPaystackTestConfig } from "../src/providers/paystack-test-config.js";

test("test configuration accepts only a Paystack test key", () => {
  const config = createPaystackTestConfig({
    secretKey: "sk_test_example",
    recipientCode: "RCP_TEST"
  });

  assert.equal(config.allowLive, false);
  assert.equal(config.recipientCode, "RCP_TEST");
});

test("test configuration rejects a live key", () => {
  assert.throws(
    () => createPaystackTestConfig({
      secretKey: "sk_live_example",
      recipientCode: "RCP_TEST"
    }),
    /requires a Paystack test secret key/
  );
});

test("test configuration requires a recipient", () => {
  assert.throws(
    () => createPaystackTestConfig({
      secretKey: "sk_test_example"
    }),
    /pre-registered test recipient code/
  );
});
