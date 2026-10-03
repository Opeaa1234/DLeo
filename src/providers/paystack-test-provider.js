// Test-only Paystack provider wiring.
// This factory cannot be configured with a live key.

import { createPaystackTransferProvider } from "./paystack-transfer.js";
import { createPaystackTestConfig } from "./paystack-test-config.js";

export function createPaystackTestProvider(options = {}) {
  const config = createPaystackTestConfig(options);

  return createPaystackTransferProvider({
    ...config,
    allowLive: false
  });
}
