export async function withRetry(operation, {
  maxAttempts = 3,
  delayMs = 0,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
} = {}) {
  if (!Number.isInteger(maxAttempts) || maxAttempts < 1) {
    throw new Error("maxAttempts must be a positive integer.");
  }

  let attempt = 0;
  while (attempt < maxAttempts) {
    attempt += 1;
    try {
      return await operation(attempt);
    } catch (error) {
      const retryable = error?.retryable === true;
      if (!retryable || attempt >= maxAttempts) throw error;
      await sleep(delayMs * 2 ** (attempt - 1));
    }
  }

  throw new Error("Retry operation ended unexpectedly.");
}
