export function summarizeSecurityHeaders(headers) {
  const checks = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy"
  ];

  const results = checks.map((name) => {
    const value = headers.get(name);
    return {
      name,
      present: Boolean(value),
      value: value || "missing"
    };
  });

  const missing = results.filter((item) => !item.present);

  return {
    results,
    missingCount: missing.length,
    status: missing.length === 0 ? "HEALTHY" : "ATTENTION"
  };
}
