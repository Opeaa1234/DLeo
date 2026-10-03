import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { createProviderAdapter } from "../src/providers/provider.js";
import { createPaystackTransferProvider } from "../src/providers/paystack-transfer.js";
import { createPaystackTestConfig } from "../src/providers/paystack-test-config.js";

test("Paystack test configuration wires through the provider adapter without live mode", async () => {
  let captured;
  const config = createPaystackTestConfig({
    secretKey: "sk_test_example",
    recipientCode: "RCP_TEST",
    maxAmount: 10000
  });

  const paystack = createPaystackTransferProvider({
    ...config,
    fetchImpl: async (_url, options) => {
      captured = options;
      return {
        ok: true,
        async json() {
          return { status: true, data: { status: "pending", reference: "sandbox-test" } };
        }
      };
    }
  });

  const provider = createProviderAdapter(paystack);
  const request = authorizePayment(
    createPaymentRequest({
      amount: 5000,
      currency: "NGN",
      merchant: "sandbox-test"
    }),
    true
  );

  const result = await provider.charge(request);

  assert.equal(config.allowLive, false);
  assert.equal(result.status, "pending");
  assert.match(captured.headers.Authorization, /^Bearer sk_test_/);
  const body = JSON.parse(captured.body);
  assert.equal(body.recipient, "RCP_TEST");
  assert.equal(body.amount, 5000);
  assert.equal(body.reference, request.id);
});

test("test configuration keeps live keys out of the adapter path", () => {
  assert.throws(
    () => createPaystackTestConfig({
      secretKey: "sk_live_example",
      recipientCode: "RCP_TEST"
    }),
    /requires a Paystack test secret key/
  );
});
