const history = [];

export function recordScan(result) {
  const entry = {
    id: `scan_${Date.now()}_${history.length + 1}`,
    timestamp: new Date().toISOString(),
    target: result.target,
    status: result.status,
    risk: result.risk,
    missingCount: result.missingCount
  };

  history.push(entry);
  return { ...entry };
}

export function getScanHistory() {
  return history.map((entry) => ({ ...entry }));
}

export function clearScanHistory() {
  history.length = 0;
}
