import test from "node:test";
import assert from "node:assert/strict";
import { assertProductionOperationAllowed } from "../src/providers/production-kill-switch.js";

test("production kill switch blocks operations by default", () => {
  assert.throws(
    () => assertProductionOperationAllowed({
      environment: "production",
      liveCredentialPresent: true,
      explicitApproval: true,
      rollbackReady: true
    }),
    /kill switch/
  );
});

test("production gate rejects missing required conditions", () => {
  const base = {
    environment: "production",
    liveCredentialPresent: true,
    explicitApproval: true,
    rollbackReady: true,
    killSwitch: false
  };

  assert.throws(() => assertProductionOperationAllowed({ ...base, environment: "test" }), /production environment/);
  assert.throws(() => assertProductionOperationAllowed({ ...base, liveCredentialPresent: false }), /live credential/);
  assert.throws(() => assertProductionOperationAllowed({ ...base, explicitApproval: false }), /Explicit production approval/);
  assert.throws(() => assertProductionOperationAllowed({ ...base, rollbackReady: false }), /Rollback readiness/);
});

test("production gate permits only an explicitly authorized configuration", () => {
  const result = assertProductionOperationAllowed({
    environment: "production",
    liveCredentialPresent: true,
    explicitApproval: true,
    rollbackReady: true,
    killSwitch: false
  });

  assert.deepEqual(result, { allowed: true });
});
