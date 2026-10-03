import test from "node:test";
import assert from "node:assert/strict";
import { createControlledTransfer } from "../src/providers/controlled-transfer.js";
import { createTransferIdempotency } from "../src/providers/transfer-idempotency.js";
import { createTransferReliability } from "../src/providers/transfer-reliability.js";
import { createTransferAudit } from "../src/providers/transfer-audit.js";

function buildController(events) {
  return createControlledTransfer({
    idempotency: createTransferIdempotency(),
    reliability: createTransferReliability({
      fetchImpl: async () => ({ ok: true, status: 200 }),
      sleep: async () => {}
    }),
    audit: createTransferAudit({ sink: event => events.push(event) })
  });
}

test("end-to-end controlled transfer executes once and audits it", async () => {
  const events = [];
  const controller = buildController(events);
  let providerCalls = 0;

  const request = { url: "https://example.test", options: {} };
  const provider = async () => {
    providerCalls += 1;
    return { providerReference: "sandbox-123", status: "pending" };
  };

  const first = await controller.execute({ reference: "e2e-1", request, provider });
  const second = await controller.execute({ reference: "e2e-1", request, provider });

  assert.deepEqual(second, first);
  assert.equal(providerCalls, 1);
  assert.deepEqual(events.map(e => e.outcome), ["success", "duplicate"]);
});

test("end-to-end flow records an ambiguous network outcome without retrying", async () => {
  const events = [];
  const controller = createControlledTransfer({
    idempotency: createTransferIdempotency(),
    reliability: createTransferReliability({
      fetchImpl: async () => {
        const error = new Error("network unavailable");
        error.name = "AbortError";
        throw error;
      },
      sleep: async () => {}
    }),
    audit: createTransferAudit({ sink: event => events.push(event) })
  });

  const result = await controller.execute({
    reference: "e2e-2",
    request: { url: "https://example.test", options: {} },
    provider: async () => ({ shouldNot: "run" })
  });

  assert.equal(result.outcome, "ambiguous_timeout");
  assert.equal(events.at(-1).outcome, "ambiguous_timeout");
});
