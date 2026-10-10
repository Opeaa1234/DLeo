import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

const REPORT_DIR = path.resolve("reports");

export async function saveReport(report, { directory = REPORT_DIR } = {}) {
  if (!report || typeof report !== "object" || Array.isArray(report)) {
    throw new TypeError("A report object is required.");
  }

  const outputDirectory = path.resolve(directory);
  await fs.mkdir(outputDirectory, { recursive: true });

  const timestamp = new Date()
    .toISOString()
    .replace(/[:.]/g, "-");

  const filename = `report-${timestamp}-${randomUUID()}.json`;
  const filepath = path.join(outputDirectory, filename);

  await fs.writeFile(
    filepath,
    `${JSON.stringify(report, null, 2)}\n`,
    { encoding: "utf8", flag: "wx" }
  );

  return filepath;
}

export function createReport(target, findings = [], summary = {}) {
  return {
    schemaVersion: "1.0",
    reportId: randomUUID(),
    tool: "DLeo",
    version: "0.2.0",
    createdAt: new Date().toISOString(),
    target,
    summary: { ...summary },
    findings: Array.isArray(findings) ? findings : []
  };
}
