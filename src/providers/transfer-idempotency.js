// In-memory idempotency boundary for the provider adapter.
// A production deployment should back this contract with a durable store.

export function createTransferIdempotency({ store = new Map() } = {}) {
  return {
    begin(reference) {
      if (!reference) throw new Error("A transfer reference is required for idempotency.");
      if (store.has(reference)) {
        return { duplicate: true, result: store.get(reference) };
      }
      store.set(reference, { status: "in_flight" });
      return { duplicate: false };
    },

    complete(reference, result) {
      if (!reference) throw new Error("A transfer reference is required for idempotency.");
      store.set(reference, { status: "completed", result });
      return store.get(reference);
    },

    fail(reference) {
      if (!reference) throw new Error("A transfer reference is required for idempotency.");
      store.delete(reference);
    }
  };
}
