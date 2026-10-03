// Paystack transfer adapter.
// No credentials are stored in this repository. Keep PAYSTACK_SECRET_KEY in a
// server-side secret store/environment variable and never commit it to Git.
// This adapter is intended for a pre-registered recipient, not arbitrary websites.
// Paystack amounts are provider subunits: NGN uses kobo, GHS uses pesewas.

import { validatePaymentPolicy } from "../payment-policy.js";
import { assertProductionActivation } from "./production-activation-guard.js";
import { createControlledTransfer } from "./controlled-transfer.js";
import { createTransferIdempotency } from "./transfer-idempotency.js";
import { createTransferReliability } from "./transfer-reliability.js";
import { createTransferAudit } from "./transfer-audit.js";

const PAYSTACK_API_URL = "https://api.paystack.co";

export function createPaystackTransferProvider({
  secretKey,
  recipientCode,
  fetchImpl = fetch,
  maxAmount = 100000,
  allowLive = false,
  environment = process.env.NODE_ENV,
  productionApproval = process.env.DLEO_PRODUCTION_ACTIVATION_APPROVED,
  auditEnabled = false,
  monitoringEnabled = false,
  rollbackEnabled = false,
  idempotency = createTransferIdempotency(),
  reliability = createTransferReliability({ fetchImpl }),
  audit = createTransferAudit()
} = {}) {
  if (!secretKey) {
    throw new Error("PAYSTACK_SECRET_KEY is required at runtime and must not be committed to Git.");
  }
  if (!recipientCode) {
    throw new Error("A pre-registered Paystack recipient code is required.");
  }

  if (secretKey.startsWith("sk_live_") && allowLive !== true) {
    throw new Error("Live Paystack transfers are disabled until explicitly enabled.");
  }

  if (allowLive === true && !secretKey.startsWith("sk_live_")) {
    throw new Error("Live Paystack transfers require a live secret key.");
  }

  if (allowLive === true && environment !== "production") {
    throw new Error("Live Paystack transfers require NODE_ENV=production.");
  }

  if (allowLive === true) {
    assertProductionActivation({
      environment,
      approval: productionApproval,
      secretKey,
      recipientCode,
      maxAmount,
      auditEnabled,
      monitoringEnabled,
      rollbackEnabled
    });
  }

  const controlledTransfer = createControlledTransfer({ idempotency, reliability, audit });

  return {
    async charge(paymentRequest) {
      validatePaymentPolicy(paymentRequest, { maxAmount });

      const request = {
        url: `${PAYSTACK_API_URL}/transfer`,
        options: {
          method: "POST",
          headers: {
            Authorization: `Bearer ${secretKey}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            source: "balance",
            amount: paymentRequest.amount,
            recipient: recipientCode,
            reference: paymentRequest.id,
            reason: paymentRequest.merchant,
            currency: paymentRequest.currency
          })
        }
      };

      return controlledTransfer.execute({
        reference: paymentRequest.id,
        request,
        provider: async (response) => {
          const data = await response.json();
          if (data.status !== true) {
            throw new Error(data.message || "Paystack transfer request failed.");
          }
          return data.data;
        }
      });
    }
  };
}
