// Final fail-closed boundary for production operations.
// This gate only authorizes the provider path; it never performs a transfer.

export function assertProductionOperationAllowed({
  environment,
  liveCredentialPresent,
  explicitApproval,
  rollbackReady,
  killSwitch = true
} = {}) {
  if (killSwitch !== false) {
    throw new Error("Production operations are disabled by the kill switch.");
  }
  if (environment !== "production") {
    throw new Error("Production operations require production environment.");
  }
  if (!liveCredentialPresent) {
    throw new Error("Production operations require a configured live credential.");
  }
  if (explicitApproval !== true) {
    throw new Error("Explicit production approval is required.");
  }
  if (rollbackReady !== true) {
    throw new Error("Rollback readiness is required.");
  }

  return { allowed: true };
}
