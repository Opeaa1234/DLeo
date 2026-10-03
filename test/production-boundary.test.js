import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");

function sourceFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    if (entry.name === "node_modules" || entry.name === ".git") return [];
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return sourceFiles(full);
    return /\.(js|mjs|cjs|json|yml|yaml)$/.test(entry.name) ? [full] : [];
  });
}

test("repository contains no live Paystack credential literal", () => {
  const matches = sourceFiles(root).filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /sk_live_[A-Za-z0-9_-]+/.test(text);
  });

  assert.deepEqual(matches, [], "live Paystack credential literals must never be committed");
});

test("production boundary remains documented", () => {
  const boundary = fs.readFileSync(
    path.join(root, "docs", "production-boundary.md"),
    "utf8"
  );

  assert.match(boundary, /Production Boundary/);
  assert.match(boundary, /explicit operator decision/i);
  assert.match(boundary, /does not enable live payments/i);
});
