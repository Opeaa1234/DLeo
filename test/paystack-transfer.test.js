import test from "node:test";
import assert from "node:assert/strict";
import { createPaymentRequest, authorizePayment } from "../src/payments.js";
import { createPaystackTransferProvider } from "../src/providers/paystack-transfer.js";

test("Paystack adapter sends only an authorized request to a fixed recipient", async () => {
  let captured;
  const provider = createPaystackTransferProvider({
    secretKey: "test-secret-not-real",
    recipientCode: "RCP_TEST",
    fetchImpl: async (_url, options) => {
      captured = options;
      return {
        ok: true,
        async json() {
          return { status: true, data: { status: "pending", reference: "test" } };
        }
      };
    }
  });

  const pending = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "test-recipient"
  });
  const authorized = authorizePayment(pending, true);
  const result = await provider.charge(authorized);

  assert.equal(result.status, "pending");
  assert.match(captured.headers.Authorization, /^Bearer /);
  const body = JSON.parse(captured.body);
  assert.equal(body.source, "balance");
  assert.equal(body.amount, 5000);
  assert.equal(body.recipient, "RCP_TEST");
  assert.equal(body.reference, authorized.id);
  assert.equal(body.currency, "NGN");
});

test("Paystack adapter blocks an unauthorized request before network access", async () => {
  const provider = createPaystackTransferProvider({
    secretKey: "test-secret-not-real",
    recipientCode: "RCP_TEST",
    fetchImpl: async () => {
      throw new Error("network call should not happen");
    }
  });

  const pending = createPaymentRequest({
    amount: 5000,
    currency: "NGN",
    merchant: "test-recipient"
  });

  await assert.rejects(() => provider.charge(pending), /authorized payment/);
});

test("Paystack adapter requires a pre-registered recipient", async () => {
  assert.throws(
    () => createPaystackTransferProvider({ secretKey: "test-secret-not-real" }),
    /pre-registered Paystack recipient code/
  );
});
