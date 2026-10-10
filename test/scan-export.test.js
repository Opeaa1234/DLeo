import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const cliPath = path.join(repoRoot, "src", "index.js");

async function withLocalSite(run) {
  const server = http.createServer((_request, response) => {
    response.writeHead(200, { "content-type": "text/plain" });
    response.end("DLeo local integration test");
  });

  await new Promise((resolve, reject) => {
    server.once("error", reject);
    server.listen(0, "127.0.0.1", resolve);
  });

  try {
    const address = server.address();
    await run(`http://127.0.0.1:${address.port}/private-path?token=do-not-save`);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

function runDLeo(url, cwd, exportJson = false) {
  const args = [cliPath, "scan", url];
  if (exportJson) args.push("--export-json");

  return new Promise((resolve, reject) => {
    const child = spawn(process.execPath, args, { cwd, stdio: ["ignore", "pipe", "pipe"] });
    let stdout = "";
    let stderr = "";
    child.stdout.setEncoding("utf8");
    child.stderr.setEncoding("utf8");
    child.stdout.on("data", (chunk) => { stdout += chunk; });
    child.stderr.on("data", (chunk) => { stderr += chunk; });
    child.once("error", reject);
    child.once("close", (code) => resolve({ code, stdout, stderr }));
  });
}

test("scan creates no report files unless JSON export is requested", async () => {
  await withLocalSite(async (url) => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "dleo-scan-no-export-"));
    try {
      const result = await runDLeo(url, cwd);
      assert.equal(result.code, 0, result.stderr);
      await assert.rejects(fs.access(path.join(cwd, "reports")), { code: "ENOENT" });
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });
});

test("scan --export-json writes a sanitized local report", async () => {
  await withLocalSite(async (url) => {
    const cwd = await fs.mkdtemp(path.join(os.tmpdir(), "dleo-scan-export-"));
    try {
      const result = await runDLeo(url, cwd, true);
      assert.equal(result.code, 0, result.stderr);
      assert.match(result.stdout, /JSON report saved locally:/);

      const reportDir = path.join(cwd, "reports");
      const files = await fs.readdir(reportDir);
      assert.equal(files.length, 1);
      assert.match(files[0], /^report-.*\.json$/);

      const report = JSON.parse(await fs.readFile(path.join(reportDir, files[0]), "utf8"));
      assert.equal(report.schemaVersion, "1.0");
      assert.equal(report.summary.httpStatus, 200);
      assert.equal(report.target, new URL(url).origin);
      assert.equal(report.summary.finalOrigin, new URL(url).origin);
      assert.ok(Array.isArray(report.findings));

      const serialized = JSON.stringify(report);
      assert.equal(serialized.includes("/private-path"), false);
      assert.equal(serialized.includes("do-not-save"), false);
      assert.equal(serialized.includes("DLeo local integration test"), false);
    } finally {
      await fs.rm(cwd, { recursive: true, force: true });
    }
  });
});
