# DLeo v0.2.0

DLeo is a personal software bug detective and repair assistant.

## Current capabilities

- Run a local health check with `npm start -- doctor`.
- Scan an HTTP/HTTPS website you own or are authorized to test with `npm start -- scan <url>`.
- Optionally export a sanitized JSON report locally with `npm start -- scan <url> --export-json`.
- Report HTTP status, response time, final origin, and selected security-header findings.
- Create and manage payment requests through a provider-neutral authorization layer.
- Exercise the payment flow safely with a local sandbox provider; the sandbox does not move real money.

## Local JSON reports

JSON export is opt-in. Without `--export-json`, scans do not create report files. When enabled, DLeo saves a JSON file under `reports/` on the local machine. Report targets are limited to the origin (scheme and host), and findings include header names/status only; URL paths, query strings, fragments, response bodies, and raw header values are not included. The `reports/` directory is ignored by Git so local exports are not accidentally committed.

Cloud backup and Firebase are not enabled by this feature.

## Payment safety

The payment layer does **not** access banking apps, passwords, PINs, OTPs, card numbers, or device storage. Real payments are not enabled by this repository yet.

The Paystack adapter is fail-closed for live transfers. A live path requires all of the following at runtime: a production environment, explicit operator approval, a provider-issued live credential, a pre-registered recipient, a positive transaction limit, audit logging, monitoring, and a tested rollback/disable path. The production activation guard never returns or stores the raw credential.

A real provider should only be connected through an authorized API using provider-issued credentials/tokens, explicit user confirmation, spending limits, and a test/sandbox environment first.

## Commands

```bash
npm start -- doctor
npm start -- scan https://example.com
npm start -- scan https://example.com --export-json
npm test
```

## Safety

Only scan websites and applications that you own or are explicitly authorized to test.

## Scope

Wallets, automatic credits, telecommunications-wide tracking, and unrestricted banking access are not part of the current v0.2.0 implementation. Future payment-provider integrations must remain separate from the DLeo core and must not store raw banking credentials.
