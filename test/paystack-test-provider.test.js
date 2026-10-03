import test from "node:test";
import assert from "node:assert/strict";
import { createPaystackTestProvider } from "../src/providers/paystack-test-provider.js";

test("test provider is wired through the Paystack adapter", () => {
  const provider = createPaystackTestProvider({
    secretKey: "sk_test_example",
    recipientCode: "RCP_TEST"
  });

  assert.equal(typeof provider.charge, "function");
});

test("test provider rejects live credentials", () => {
  assert.throws(
    () => createPaystackTestProvider({
      secretKey: "sk_live_example",
      recipientCode: "RCP_TEST"
    }),
    /requires a Paystack test secret key/
  );
});

test("test provider still requires a registered recipient", () => {
  assert.throws(
    () => createPaystackTestProvider({
      secretKey: "sk_test_example"
    }),
    /pre-registered test recipient code/
  );
});
