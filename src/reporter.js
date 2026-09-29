import fs from "node:fs/promises";
import path from "node:path";

const REPORT_DIR = path.resolve("reports");

export async function saveReport(report) {
  await fs.mkdir(REPORT_DIR, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const filename = `report-${timestamp}.json`;
  const filepath = path.join(REPORT_DIR, filename);

  await fs.writeFile(
    filepath,
    JSON.stringify(report, null, 2),
    "utf8"
  );

  return filepath;
}

export function createReport(target, findings = []) {
  return {
    tool: "DLeo",
    version: "0.2.0",
    createdAt: new Date().toISOString(),
    target,
    findings
  };
}