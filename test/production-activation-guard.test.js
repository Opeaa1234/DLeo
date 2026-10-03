import test from "node:test";
import assert from "node:assert/strict";
import { assertProductionActivation } from "../src/providers/production-activation-guard.js";

const valid = {
  environment: "production",
  approval: "true",
  secretKey: "sk_live_example",
  recipientCode: "RCP_PROD_TEST",
  maxAmount: 100000,
  auditEnabled: true,
  monitoringEnabled: true,
  rollbackEnabled: true
};

test("production activation passes only when every explicit precondition is satisfied", () => {
  const result = assertProductionActivation(valid);

  assert.equal(result.environment, "production");
  assert.equal(result.approved, true);
  assert.equal(result.maxAmount, 100000);
});

test("production activation rejects sandbox environment", () => {
  assert.throws(
    () => assertProductionActivation({ ...valid, environment: "test" }),
    /NODE_ENV=production/
  );
});

test("production activation requires explicit operator approval", () => {
  assert.throws(
    () => assertProductionActivation({ ...valid, approval: "false" }),
    /explicit operator approval/
  );
});

test("production activation rejects a test key", () => {
  assert.throws(
    () => assertProductionActivation({ ...valid, secretKey: "sk_test_example" }),
    /production Paystack secret key/
  );
});

test("production activation requires a recipient and positive amount limit", () => {
  assert.throws(
    () => assertProductionActivation({ ...valid, recipientCode: "" }),
    /production recipient code/
  );

  assert.throws(
    () => assertProductionActivation({ ...valid, maxAmount: 0 }),
    /positive production transaction limit/
  );
});

test("production activation requires audit, monitoring, and rollback controls", () => {
  assert.throws(
    () => assertProductionActivation({ ...valid, auditEnabled: false }),
    /audit logging/
  );

  assert.throws(
    () => assertProductionActivation({ ...valid, monitoringEnabled: false }),
    /monitoring/
  );

  assert.throws(
    () => assertProductionActivation({ ...valid, rollbackEnabled: false }),
    /rollback\/disable path/
  );
});
