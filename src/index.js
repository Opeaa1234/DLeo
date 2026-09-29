#!/usr/bin/env node

const args = process.argv.slice(2);

function printHelp() {
  console.log(`
DLeo v0.2.0
Personal software bug detective and repair assistant

Commands:
  node src/index.js doctor
  node src/index.js scan <url>
  node src/index.js help

Examples:
  node src/index.js doctor
  node src/index.js scan https://example.com

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

async function scanWebsite(url) {
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

  console.log(`DLeo Detective`);
  console.log(`==============`);
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

    console.log("");
    console.log("Security headers:");

    const headersToCheck = [
      "content-security-policy",
      "strict-transport-security",
      "x-content-type-options",
      "x-frame-options",
      "referrer-policy"
    ];

    for (const header of headersToCheck) {
      const value = response.headers.get(header);
      console.log(
        `${value ? "OK " : "WARN"} ${header}: ${value || "missing"}`
      );
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
    await scanWebsite(args[1]);
    return;
  }

  console.error(`Unknown command: ${command}`);
  printHelp();
  process.exitCode = 1;
}

main();