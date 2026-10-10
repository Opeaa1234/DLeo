#!/usr/bin/env node

import { summarizeSecurityHeaders } from "./security-summary.js";
import { createReport, saveReport } from "./reporter.js";

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
DLeo v0.2.0
Personal software bug detective and repair assistant

Commands:
  node src/index.js doctor
  node src/index.js scan <url> [--export-json]
  node src/index.js help

Examples:
  node src/index.js doctor
  node src/index.js scan https://example.com
  node src/index.js scan https://example.com --export-json

JSON reports are saved locally in the reports/ folder only when --export-json is supplied.
Only scan websites and applications you own or are authorized to test.
`);
}

async function doctor() {
  console.log("DLeo Doctor");
  console.log("-----------");
  console.log("Status: DLeo is ready.");
  console.log("Node.js: detected");
  console.log("Detective engine: ready");
  console.log("Safety mode: authorized targets only");
}

async function scanWebsite(url, { exportJson = false } = {}) {
  if (!url) {
    console.error("Error: provide a URL.");
    console.error("Example: node src/index.js scan https://example.com");
    process.exitCode = 1;
    return;
  }

  let target;

  try {
    target = new URL(url);
  } catch {
    console.error("Error: invalid URL.");
    process.exitCode = 1;
    return;
  }

  if (!["http:", "https:"].includes(target.protocol)) {
    console.error("Error: only HTTP and HTTPS URLs are supported.");
    process.exitCode = 1;
    return;
  }

  console.log("DLeo Detective");
  console.log("==============");
  console.log(`Target: ${target.href}`);
  console.log("");

  const started = Date.now();

  try {
    const response = await fetch(target.href, {
      method: "GET",
      redirect: "follow",
      signal: AbortSignal.timeout(15000)
    });

    const elapsed = Date.now() - started;

    console.log(`HTTP status: ${response.status}`);
    console.log(`Response time: ${elapsed} ms`);
    console.log(`Final URL: ${response.url}`);

    const security = summarizeSecurityHeaders(response.headers);

    console.log("");
    console.log("Security headers:");

    for (const result of security.results) {
      console.log(
        `${result.present ? "OK " : "WARN"} ${result.name}: ${result.value}`
      );
    }

    console.log("");
    console.log(`Risk summary: ${security.status}`);
    console.log(`Missing/weak checks: ${security.missingCount}`);

    if (exportJson) {
      // Reports intentionally store origins only, never URL paths, queries, or fragments.
      // Findings contain header names and status only, not response bodies or header values.
      const reportFindings = security.results
        .filter((item) => !item.present)
        .map((item) => ({
          type: "missing-security-header",
          severity: "low",
          header: item.name,
          message: `Security header "${item.name}" is missing.`
        }));

      const report = createReport(target.origin, reportFindings, {
        httpStatus: response.status,
        responseTimeMs: elapsed,
        finalOrigin: new URL(response.url).origin,
        securityStatus: security.status,
        missingCount: security.missingCount
      });

      try {
        const filepath = await saveReport(report);
        console.log(`JSON report saved locally: ${filepath}`);
      } catch (error) {
        console.error(`Could not save JSON report: ${error.message}`);
        process.exitCode = 1;
      }
    }

    console.log("");
    console.log("DLeo scan complete.");
    console.log("Findings above should be reviewed before making changes.");
  } catch (error) {
    console.error("");
    console.error("DLeo detected a connection problem:");
    console.error(error.message);
    process.exitCode = 1;
  }
}

async function main() {
  const command = args[0];

  if (!command || command === "help" || command === "--help") {
    printHelp();
    return;
  }

  if (command === "doctor") {
    await doctor();
    return;
  }

  if (command === "scan") {
    await scanWebsite(args[1], {
      exportJson: args.slice(2).includes("--export-json")
    });
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

main();
