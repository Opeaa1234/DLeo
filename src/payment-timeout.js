export async function withTimeout(operation, timeoutMs, {
  createTimeoutError = () => Object.assign(new Error("Provider operation timed out"), { retryable: true, code: "PROVIDER_TIMEOUT" })
} = {}) {
  if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive number.");
  }

  let timer;
  try {
    return await Promise.race([
      Promise.resolve().then(operation),
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(createTimeoutError()), timeoutMs);
      })
    ]);
  } finally {
    clearTimeout(timer);
  }
}
