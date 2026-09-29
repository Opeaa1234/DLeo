export const config = {
  name: "DLeo",
  version: "0.2.0",

  detective: {
    timeoutMs: 15000,
    followRedirects: true
  },

  safety: {
    authorizedTargetsOnly: true,
    allowDestructiveActions: false,
    requireApprovalBeforeFixes: true
  },

  reports: {
    directory: "reports"
  }
};