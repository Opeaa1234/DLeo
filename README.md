# DLeo v0.2.0

DLeo is a personal software bug detective and repair assistant.

## Current capabilities

- Run a local health check with `node src/index.js doctor`.
- Scan an HTTP/HTTPS website you own or are authorized to test with `node src/index.js scan <url>`.
- Report the HTTP status, response time, final URL, and selected security headers.
- Operate in an authorization-first safety mode.

## Commands

```bash
npm start -- doctor
npm start -- scan https://example.com
npm test
```

## Safety

Only scan websites and applications that you own or are explicitly authorized to test.

## Scope note

Wallets, banking connections, automatic credits, telecommunications-wide tracking, and other future ideas are not part of the current v0.2.0 implementation. They should not be described as implemented until the corresponding code and security design exist.
