import test from "node:test";
import assert from "node:assert/strict";
import { createTransferIdempotency } from "../src/providers/transfer-idempotency.js";

test("idempotency marks a new transfer as in flight", () => {
  const idempotency = createTransferIdempotency();
  assert.deepEqual(idempotency.begin("ref-1"), { duplicate: false });
});

test("idempotency detects a repeated reference", () => {
  const idempotency = createTransferIdempotency();
  idempotency.begin("ref-2");
  idempotency.complete("ref-2", { status: "pending" });

  assert.deepEqual(idempotency.begin("ref-2"), {
    duplicate: true,
    result: { status: "completed", result: { status: "pending" } }
  });
});

test("idempotency stores a completed result", () => {
  const idempotency = createTransferIdempotency();
  idempotency.begin("ref-3");
  const result = idempotency.complete("ref-3", { providerReference: "ps_123" });

  assert.equal(result.status, "completed");
  assert.equal(result.result.providerReference, "ps_123");
});

test("idempotency can release a failed attempt for controlled retry", () => {
  const idempotency = createTransferIdempotency();
  idempotency.begin("ref-4");
  idempotency.fail("ref-4");

  assert.deepEqual(idempotency.begin("ref-4"), { duplicate: false });
});
