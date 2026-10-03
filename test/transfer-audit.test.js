import test from "node:test";
import assert from "node:assert/strict";
import { createTransferAudit } from "../src/providers/transfer-audit.js";

test("audit records safe transfer metadata", () => {
  let event;
  const audit = createTransferAudit({ sink: (value) => { event = value; } });
  const result = audit.record({
    reference: "ref-1",
    outcome: "success",
    attempts: 1,
    providerStatus: 200,
    timestamp: "2026-10-02T12:00:00.000Z"
  });

  assert.deepEqual(result, event);
  assert.equal(result.reference, "ref-1");
  assert.equal(result.outcome, "success");
  assert.equal(result.attempts, 1);
  assert.equal(result.providerStatus, 200);
  assert.equal(result.secretKey, undefined);
});

test("audit requires a reference and outcome", () => {
  const audit = createTransferAudit();
  assert.throws(() => audit.record({ outcome: "success", attempts: 1 }), /audit reference/);
  assert.throws(() => audit.record({ reference: "ref-2", attempts: 1 }), /audit outcome/);
});
