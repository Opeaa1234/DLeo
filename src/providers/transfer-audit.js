// Safe transfer audit events. Never include credentials, authorization headers,
// PINs, OTPs, card data, or request bodies containing secrets.

const SENSITIVE_KEYS = /secret|authorization|token|password|pin|otp|card/i;

export function createTransferAudit({ sink = () => {} } = {}) {
  return {
    record({ reference, outcome, attempts, providerStatus, timestamp = new Date().toISOString() }) {
      if (!reference) throw new Error("An audit reference is required.");
      if (!outcome) throw new Error("An audit outcome is required.");
      const event = Object.freeze({
        type: "transfer",
        reference,
        outcome,
        attempts,
        providerStatus,
        timestamp
      });
      if (Object.keys(event).some((key) => SENSITIVE_KEYS.test(key))) {
        throw new Error("Sensitive fields are not permitted in transfer audit events.");
      }
      sink(event);
      return event;
    }
  };
}
