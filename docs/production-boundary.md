# Production Boundary

## Current status
DLeo is sandbox/test-only at this checkpoint. The Paystack test configuration must not be used to initiate live payments.

## Required separation
- Test credentials are supplied at runtime and must use the `sk_test_` prefix.
- Production credentials must never be committed to source control, tests, fixtures, logs, or documentation.
- The test provider must remain unavailable in `production`.
- Test configuration must keep `allowLive` set to `false`.
- Test recipients must be explicitly registered.
- Production activation requires an explicit operator decision and a separately reviewed production configuration.

## Before any production provider connection
1. Review the production provider's official API and account requirements.
2. Configure production credentials only through a secure secret-management mechanism.
3. Keep production credentials completely separate from sandbox credentials.
4. Verify transaction authorization, recipient controls, amount limits, idempotency, retries, timeouts, and audit logging in the production configuration.
5. Run a controlled production-readiness review before enabling any real-money operation.

## Explicit non-goals of this document
This document does not enable live payments, store credentials, or authorize a real transaction.
