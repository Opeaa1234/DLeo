import test from "node:test";
import assert from "node:assert/strict";
import { validatePaystackTestEnvironment } from "../src/providers/paystack-test-preflight.js";

test("test preflight accepts a non-production test environment", () => {
  const result = validatePaystackTestEnvironment({
    nodeEnv: "test",
    secretKey: "sk_test_example",
    recipientCode: "RCP_TEST"
  });

  assert.equal(result.environment, "test");
  assert.equal(result.allowLive, false);
});

test("test preflight rejects production", () => {
  assert.throws(
    () => validatePaystackTestEnvironment({
      nodeEnv: "production",
      secretKey: "sk_test_example",
      recipientCode: "RCP_TEST"
    }),
    /cannot run in production/
  );
});

test("test preflight rejects live credentials", () => {
  assert.throws(
    () => validatePaystackTestEnvironment({
      nodeEnv: "test",
      secretKey: "sk_live_example",
      recipientCode: "RCP_TEST"
    }),
    /requires a test secret key/
  );
});
