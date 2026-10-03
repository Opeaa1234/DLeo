// Reliability helpers for provider transfers.
// This layer deliberately does not retry ambiguous provider outcomes.

export function createTransferReliability({
  fetchImpl = fetch,
  timeoutMs = 10000,
  maxRetries = 2,
  sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))
} = {}) {
  if (!Number.isInteger(timeoutMs) || timeoutMs <= 0) {
    throw new Error("timeoutMs must be a positive integer.");
  }
  if (!Number.isInteger(maxRetries) || maxRetries < 0 || maxRetries > 2) {
    throw new Error("maxRetries must be an integer from 0 through 2.");
  }

  return {
    async execute({ url, options, reference }) {
      if (!reference) throw new Error("A deterministic transfer reference is required.");
      let attempt = 0;
      while (attempt <= maxRetries) {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeoutMs);
        try {
          const response = await fetchImpl(url, { ...options, signal: controller.signal });
          clearTimeout(timer);
          if (response.ok) return { response, attempts: attempt + 1, outcome: "success" };
          if (![429, 500, 502, 503, 504].includes(response.status)) {
            return { response, attempts: attempt + 1, outcome: "definitive_failure" };
          }
          attempt += 1;
          if (attempt > maxRetries) return { response, attempts: attempt, outcome: "definitive_failure" };
          await sleep(250 * 2 ** (attempt - 1));
        } catch (error) {
          clearTimeout(timer);
          if (error?.name === "AbortError") return { error, attempts: attempt + 1, outcome: "ambiguous_timeout" };
          return { error, attempts: attempt + 1, outcome: "ambiguous_network_error" };
        }
      }
    }
  };
}
