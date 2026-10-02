const transitions = Object.freeze({
  pending_authorization: new Set(["authorized", "revoked"]),
  authorized: new Set(["submitted", "revoked"]),
  submitted: new Set(["simulated", "accepted", "rejected"]),
  simulated: new Set(),
  accepted: new Set(),
  rejected: new Set(),
  revoked: new Set()
});

export function transitionPayment(request, nextStatus) {
  if (!request || typeof request.status !== "string") {
    throw new TypeError("A payment request with a status is required.");
  }

  const allowed = transitions[request.status];
  if (!allowed || !allowed.has(nextStatus)) {
    throw new Error(`Invalid payment transition: ${request.status} -> ${nextStatus}`);
  }

  return Object.freeze({
    ...request,
    status: nextStatus,
    updatedAt: new Date().toISOString()
  });
}

export function allowedPaymentTransitions(status) {
  return [...(transitions[status] ?? [])];
}
