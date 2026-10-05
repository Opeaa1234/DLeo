import test from "node:test";
import assert from "node:assert/strict";
import {
  recordScan,
  getScanHistory,
  clearScanHistory
} from "../src/scan-history.js";

test("scan history records and returns a safe summary", () => {
  clearScanHistory();

  const entry = recordScan({
    target: "https://authorized.example",
    status: "COMPLETE",
    risk: "HEALTHY",
    missingCount: 0
  });

  assert.equal(entry.status, "COMPLETE");
  assert.equal(entry.risk, "HEALTHY");
  assert.equal(getScanHistory().length, 1);
});

test("scan history can be cleared", () => {
  clearScanHistory();
  assert.equal(getScanHistory().length, 0);
});
