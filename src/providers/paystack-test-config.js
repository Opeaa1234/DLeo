// Safe test-environment configuration for the Paystack adapter.
// No credentials are stored here. A test key must be supplied at runtime.

export function createPaystackTestConfig({
  secretKey,
  recipientCode,
  maxAmount = 100000
} = {}) {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required at runtime.");
  }

  if (!secretKey.startsWith("sk_test_")) {
    throw new Error("Test configuration requires a Paystack test secret key.");
  }

  if (!recipientCode) {
    throw new Error("A pre-registered test recipient code is required.");
  }

  return {
    secretKey,
    recipientCode,
    maxAmount,
    allowLive: false
  };
}
