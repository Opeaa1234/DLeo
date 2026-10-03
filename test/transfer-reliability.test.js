import test from "node:test";
import assert from "node:assert/strict";
import { createTransferReliability } from "../src/providers/transfer-reliability.js";

test("reliability retries only bounded transient provider failures", async () => {
  let calls = 0;
  const reliability = createTransferReliability({
    maxRetries: 2,
    sleep: async () => {},
    fetchImpl: async () => {
      calls += 1;
      if (calls < 3) return { ok: false, status: 503 };
      return { ok: true, status: 200 };
    }
  });

  const result = await reliability.execute({ url: "https://example.test", options: {}, reference: "ref-1" });
  assert.equal(result.outcome, "success");
  assert.equal(result.attempts, 3);
});

test("reliability does not retry definitive provider failures", async () => {
  let calls = 0;
  const reliability = createTransferReliability({
    maxRetries: 2,
    sleep: async () => {},
    fetchImpl: async () => {
      calls += 1;
      return { ok: false, status: 400 };
    }
  });

  const result = await reliability.execute({ url: "https://example.test", options: {}, reference: "ref-2" });
  assert.equal(result.outcome, "definitive_failure");
  assert.equal(result.attempts, 1);
  assert.equal(calls, 1);
});

test("reliability marks timeouts as ambiguous instead of retrying", async () => {
  let calls = 0;
  const reliability = createTransferReliability({
    maxRetries: 2,
    timeoutMs: 1,
    fetchImpl: async () => {
      calls += 1;
      const error = new Error("timed out");
      error.name = "AbortError";
      throw error;
    }
  });

  const result = await reliability.execute({ url: "https://example.test", options: {}, reference: "ref-3" });
  assert.equal(result.outcome, "ambiguous_timeout");
  assert.equal(result.attempts, 1);
  assert.equal(calls, 1);
});

test("reliability requires a deterministic reference", async () => {
  const reliability = createTransferReliability({ fetchImpl: async () => ({ ok: true }) });
  await assert.rejects(
    () => reliability.execute({ url: "https://example.test", options: {} }),
    /deterministic transfer reference/
  );
});
