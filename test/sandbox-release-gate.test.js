import test from "node:test";
import assert from "node:assert/strict";
import { createPaystackTestConfig } from "../src/providers/paystack-test-config.js";
import { createPaystackTestProvider } from "../src/providers/paystack-test-provider.js";

// Final sandbox-only release gate. No live credentials and no external network calls.

test("sandbox release gate keeps provider in test mode", () => {
  const config = createPaystackTestConfig({
    secretKey: "sk_test_release_gate",
    recipientCode: "RCP_TEST_RELEASE"
  });

  assert.equal(config.allowLive, false);
  assert.match(config.secretKey, /^sk_test_/);
  assert.equal(config.recipientCode, "RCP_TEST_RELEASE");
});

test("sandbox release gate rejects a live credential", () => {
  assert.throws(
    () => createPaystackTestProvider({
      secretKey: "sk_live_release_gate",
      recipientCode: "RCP_TEST_RELEASE"
    }),
    /requires a Paystack test secret key/
  );
});
