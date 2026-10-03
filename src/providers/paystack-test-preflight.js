// Preflight guard for the Paystack test environment.
// This performs configuration checks only; it never contacts Paystack.

export function validatePaystackTestEnvironment({
  nodeEnv = "test",
  secretKey,
  recipientCode
} = {}) {
  if (nodeEnv === "production") {
    throw new Error("Paystack test provider cannot run in production.");
  }

  if (!secretKey || !secretKey.startsWith("sk_test_")) {
    throw new Error("Paystack test environment requires a test secret key.");
  }

  if (!recipientCode) {
    throw new Error("Paystack test environment requires a test recipient code.");
  }

  return Object.freeze({
    environment: "test",
    allowLive: false,
    networkCallsAllowed: true
  });
}
