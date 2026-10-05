import test from "node:test";
import assert from "node:assert/strict";
import { summarizeSecurityHeaders } from "../src/security-summary.js";

function headers(values) {
  return {
    get(name) {
      return values[name] ?? null;
    }
  };
}

test("security summary is healthy when all selected headers are present", () => {
  const report = summarizeSecurityHeaders(headers({
    "content-security-policy": "default-src 'self'",
    "strict-transport-security": "max-age=31536000",
    "x-content-type-options": "nosniff",
    "x-frame-options": "DENY",
    "referrer-policy": "no-referrer"
  }));

  assert.equal(report.status, "HEALTHY");
  assert.equal(report.missingCount, 0);
  assert.equal(report.results.length, 5);
});

test("security summary reports attention when headers are missing", () => {
  const report = summarizeSecurityHeaders(headers({
    "content-security-policy": "default-src 'self'",
    "x-content-type-options": "nosniff"
  }));

  assert.equal(report.status, "ATTENTION");
  assert.equal(report.missingCount, 3);
  assert.equal(report.results.find((item) => item.name === "x-frame-options").present, false);
});
