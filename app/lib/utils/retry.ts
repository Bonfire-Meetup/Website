export function withRetry<T>(fn: () => Promise<T>, retries = 3): Promise<T> {
  const attempt = async (remaining: number, attemptNumber: number): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (remaining <= 0) {
        throw error;
      }

      const baseDelay = 200 * 2 ** (attemptNumber - 1);
      const jitter = Math.floor(Math.random() * 100);
      const delayMs = baseDelay + jitter;

      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });

      return attempt(remaining - 1, attemptNumber + 1);
    }
  };

  return attempt(retries, 1);
}
