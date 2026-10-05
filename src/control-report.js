export function buildControlReport({
  auditEvents = [],
  environment = "sandbox",
  realMoneyEnabled = false
} = {}) {
  const events = Array.isArray(auditEvents) ? auditEvents : [];
  const actions = new Set(events.map((event) => event?.action));

  const checks = {
    authorization: actions.has("payment.authorized"),
    stateControl: actions.has("payment.submitted"),
    sandboxExecution: environment === "sandbox" && actions.has("payment.sandbox_simulated"),
    auditTrail: events.length > 0,
    liveMoneyDisabled: realMoneyEnabled === false
  };

  const passed = Object.values(checks).every(Boolean);

  return Object.freeze({
    environment,
    realMoneyEnabled: Boolean(realMoneyEnabled),
    checks: Object.freeze({ ...checks }),
    status: passed ? "healthy" : "attention_required"
  });
}
