# Production Activation Runbook

## Scope
This runbook describes the review required before DLeo could ever be connected to a live payment provider. It does not enable live payments and does not contain credentials.

## Preconditions
- Sandbox release-gate tests are green.
- Production-boundary and credential-guard checks are green.
- Production credentials are stored only in an approved secret-management system.
- Sandbox and production credentials/configuration are separate.
- A human operator has explicitly approved production activation.

## Pre-activation review
1. Confirm the deployment environment is explicitly production.
2. Confirm the live provider account and recipient controls have been independently verified.
3. Confirm authorization, amount limits, idempotency, timeout/retry behavior, and audit logging.
4. Confirm monitoring and an operational rollback/disable procedure.
5. Confirm no live secret is present in source, fixtures, logs, or build artifacts.

## Activation rule
Live connectivity must remain disabled unless every precondition is satisfied and an authorized human explicitly enables it. Sandbox configuration must never be promoted into production by an automatic test or workflow.

## Post-activation verification
Use only a provider-approved controlled verification procedure. Record the result in the audit trail. If any boundary, authorization, or audit check fails, disable live connectivity and investigate before further transactions.
