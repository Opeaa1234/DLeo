// In-memory idempotency guard for sandbox/development flows.
// A production implementation should use a durable, provider-supported idempotency key store.

export function createIdempotencyStore() {
  const results = new Map();

  return Object.freeze({
    get(key) {
      return results.get(key);
    },
    set(key, value) {
      if (!key) throw new TypeError("An idempotency key is required.");
      if (results.has(key)) return results.get(key);
      results.set(key, value);
      return value;
    },
    has(key) {
      return results.has(key);
    }
  });
}

export function paymentIdempotencyKey(request) {
  if (!request?.id) throw new TypeError("A payment request id is required.");
  return `payment:${request.id}`;
}
