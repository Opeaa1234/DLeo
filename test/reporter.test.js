import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { createReport, saveReport } from "../src/reporter.js";

test("createReport returns a versioned report with supplied summary and findings", () => {
  const report = createReport(
    "https://example.test",
    [{ type: "missing-security-header", severity: "low", header: "x-frame-options" }],
    { httpStatus: 200, responseTimeMs: 42, securityStatus: "ATTENTION", missingCount: 1 }
  );

  assert.equal(report.schemaVersion, "1.0");
  assert.equal(report.tool, "DLeo");
  assert.equal(report.version, "0.2.0");
  assert.equal(report.target, "https://example.test");
  assert.match(report.reportId, /^[0-9a-f-]{36}$/i);
  assert.doesNotThrow(() => new Date(report.createdAt).toISOString());
  assert.equal(report.summary.httpStatus, 200);
  assert.equal(report.findings[0].header, "x-frame-options");
});

test("saveReport writes valid JSON locally and creates unique filenames", async () => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), "dleo-report-test-"));

  try {
    const report = createReport("https://example.test", [], { httpStatus: 200 });
    const firstPath = await saveReport(report, { directory });
    const secondPath = await saveReport(report, { directory });

    assert.notEqual(firstPath, secondPath);
    assert.equal(path.dirname(firstPath), directory);
    assert.deepEqual(JSON.parse(await fs.readFile(firstPath, "utf8")), report);
    assert.match(path.basename(firstPath), /^report-.*\.json$/);
  } finally {
    await fs.rm(directory, { recursive: true, force: true });
  }
});

test("saveReport rejects non-object report input", async () => {
  await assert.rejects(
    () => saveReport(null, { directory: os.tmpdir() }),
    { name: "TypeError" }
  );
});
