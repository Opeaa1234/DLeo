// Controlled transfer orchestration for test/sandbox verification.
// The provider itself remains responsible for enforcing production activation.

export function createControlledTransfer({ idempotency, reliability, audit }) {
  if (!idempotency || !reliability || !audit) {
    throw new Error("Idempotency, reliability, and audit controls are required.");
  }

  return {
    async execute({ reference, request, provider }) {
      const started = idempotency.begin(reference);
      if (started.duplicate) {
        audit.record({
          reference,
          outcome: "duplicate",
          attempts: 0,
          providerStatus: undefined
        });
        return started.result;
      }

      try {
        const result = await reliability.execute({
          url: request.url,
          options: request.options,
          reference
        });

        if (result.outcome === "success") {
          const value = await provider(result.response);
          const completed = idempotency.complete(reference, value);
          audit.record({
            reference,
            outcome: "success",
            attempts: result.attempts,
            providerStatus: result.response.status
          });
          return completed.result;
        }

        audit.record({
          reference,
          outcome: result.outcome,
          attempts: result.attempts,
          providerStatus: result.response?.status
        });
        return result;
      } catch (error) {
        idempotency.fail(reference);
        audit.record({
          reference,
          outcome: "processing_error",
          attempts: 1,
          providerStatus: undefined
        });
        throw error;
      }
    }
  };
}
