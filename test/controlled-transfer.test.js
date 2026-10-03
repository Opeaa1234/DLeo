import test from "node:test";
import assert from "node:assert/strict";
import { createControlledTransfer } from "../src/providers/controlled-transfer.js";
import { createTransferIdempotency } from "../src/providers/transfer-idempotency.js";
import { createTransferReliability } from "../src/providers/transfer-reliability.js";
import { createTransferAudit } from "../src/providers/transfer-audit.js";

function controls(events = []) {
  return {
    idempotency: createTransferIdempotency(),
    reliability: createTransferReliability({ fetchImpl: async () => ({ ok: true, status: 200 }), sleep: async () => {} }),
    audit: createTransferAudit({ sink: (event) => events.push(event) })
  };
}

test("controlled transfer completes once and records an audit event", async () => {
  const events = [];
  const controller = createControlledTransfer(controls(events));
  const value = await controller.execute({
    reference: "ref-10",
    request: { url: "https://example.test", options: {} },
    provider: async () => ({ providerReference: "ps_test_10" })
  });

  assert.deepEqual(value, { providerReference: "ps_test_10" });
  assert.equal(events.at(-1).outcome, "success");
  assert.equal(events.at(-1).reference, "ref-10");
});

test("controlled transfer returns the stored result for a duplicate reference", async () => {
  const events = [];
  const controller = createControlledTransfer(controls(events));
  const request = { url: "https://example.test", options: {} };
  const provider = async () => ({ providerReference: "ps_test_11" });

  const first = await controller.execute({ reference: "ref-11", request, provider });
  const second = await controller.execute({ reference: "ref-11", request, provider });

  assert.deepEqual(second, first);
  assert.equal(events.at(-1).outcome, "duplicate");
});
