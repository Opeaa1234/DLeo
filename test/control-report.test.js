import test from "node:test";
import assert from "node:assert/strict";
import { buildControlReport } from "../src/control-report.js";

test("control report is healthy for a completed sandbox payment", () => {
  const report = buildControlReport({
    environment: "sandbox",
    realMoneyEnabled: false,
    controls: {
      idempotency: true,
      reliability: true
    },
    auditEvents: [
      { action: "payment.authorized" },
      { action: "payment.submitted" },
      { action: "payment.sandbox_simulated" }
    ]
  });

  assert.equal(report.status, "healthy");
  assert.equal(report.realMoneyEnabled, false);
  assert.equal(report.checks.authorization, true);
  assert.equal(report.checks.stateControl, true);
  assert.equal(report.checks.sandboxExecution, true);
  assert.equal(report.checks.idempotency, true);
  assert.equal(report.checks.reliability, true);
  assert.equal(report.checks.auditTrail, true);
  assert.equal(report.checks.liveMoneyDisabled, true);
});

test("control report requires sandbox and live-money disabled", () => {
  const report = buildControlReport({
    environment: "production",
    realMoneyEnabled: true,
    controls: {
      idempotency: true,
      reliability: true
    },
    auditEvents: [
      { action: "payment.authorized" },
      { action: "payment.submitted" },
      { action: "payment.sandbox_simulated" }
    ]
  });

  assert.equal(report.status, "attention_required");
  assert.equal(report.checks.sandboxExecution, false);
  assert.equal(report.checks.liveMoneyDisabled, false);
});

test("control report flags missing reliability controls", () => {
  const report = buildControlReport({
    environment: "sandbox",
    realMoneyEnabled: false,
    controls: {
      idempotency: true,
      reliability: false
    },
    auditEvents: [
      { action: "payment.authorized" },
      { action: "payment.submitted" },
      { action: "payment.sandbox_simulated" }
    ]
  });

  assert.equal(report.status, "attention_required");
  assert.equal(report.checks.idempotency, true);
  assert.equal(report.checks.reliability, false);
});
