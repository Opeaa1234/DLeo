# Production Readiness Checklist

This checklist records review items; it does not authorize live payments.

## Required before production activation

- [ ] Production credentials are stored only in a secure secret-management mechanism.
- [ ] Sandbox and production credentials/configuration are completely separated.
- [ ] Production provider configuration is reviewed independently from the sandbox provider.
- [ ] Authorization rules and recipient allow-list controls are verified.
- [ ] Production transaction amount limits are explicitly configured and reviewed.
- [ ] Idempotency protection is verified for repeated requests.
- [ ] Retry and timeout behavior is bounded and reviewed.
- [ ] Audit events are generated for authorization, submission, success, failure, and recovery paths.
- [ ] Live-key rejection remains covered by sandbox tests.
- [ ] A controlled production smoke test is planned with an explicitly approved test transaction.
- [ ] Explicit operator approval is recorded before enabling any real-money operation.

## Current checkpoint

Sandbox/test environment: PASS according to the latest GitHub Actions results reviewed in this project.

Production activation: NOT ENABLED.

No live credential, real recipient, or real-money transaction is authorized by this checklist.
