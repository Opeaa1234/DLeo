# DLeo v0.2.0

DLeo is a personal software bug detective and repair assistant.

## Current capabilities

- Run a local health check with `npm start -- doctor`.
- Scan an HTTP/HTTPS website you own or are authorized to test with `npm start -- scan <url>`.
- Report HTTP status, response time, final URL, and selected security headers.
- Create and manage payment requests through a provider-neutral authorization layer.
- Exercise the payment flow safely with a local sandbox provider; the sandbox does not move real money.

## Payment safety

The payment layer does **not** access banking apps, passwords, PINs, OTPs, card numbers, or device storage. Real payments are not enabled by this repository yet.

A real provider should only be connected through an authorized API using provider-issued credentials/tokens, explicit user confirmation, spending limits, and a test/sandbox environment first.

## Commands

```bash
npm start -- doctor
npm start -- scan https://example.com
npm test
```

## Safety

Only scan websites and applications that you own or are explicitly authorized to test.

## Scope

Wallets, automatic credits, telecommunications-wide tracking, and unrestricted banking access are not part of the current v0.2.0 implementation. Future payment-provider integrations must remain separate from the DLeo core and must not store raw banking credentials.
