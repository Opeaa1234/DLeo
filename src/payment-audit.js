import { randomUUID } from "node:crypto";

export function createAuditEvent({ request, action, outcome, provider = null, detail = null }) {
  if (!request?.id) throw new TypeError("request.id is required");
  if (!action || !outcome) throw new TypeError("action and outcome are required");

  return Object.freeze({
    eventId: randomUUID(),
    timestamp: new Date().toISOString(),
    paymentId: request.id,
    action,
    outcome,
    provider,
    amount: request.amount,
    currency: request.currency,
    merchant: request.merchant,
    detail
  });
}

export function createAuditLog() {
  const events = [];

  return Object.freeze({
    append(event) {
      if (!event?.eventId || !event.paymentId || !event.timestamp) {
        throw new TypeError("Invalid audit event");
      }
      events.push(Object.freeze({ ...event }));
      return event;
    },
    list() {
      return events.map((event) => ({ ...event }));
    }
  });
}
