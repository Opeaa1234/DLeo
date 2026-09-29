export function detectHttpIssues(response) {
  const findings = [];

  if (response.status >= 400) {
    findings.push({
      type: "http-error",
      severity: response.status >= 500 ? "high" : "medium",
      message: `HTTP response returned status ${response.status}.`
    });
  }

  const securityHeaders = [
    "content-security-policy",
    "strict-transport-security",
    "x-content-type-options",
    "x-frame-options",
    "referrer-policy"
  ];

  for (const header of securityHeaders) {
    if (!response.headers.get(header)) {
      findings.push({
        type: "missing-security-header",
        severity: "low",
        header,
        message: `Security header "${header}" is missing.`
      });
    }
  }

  return findings;
}