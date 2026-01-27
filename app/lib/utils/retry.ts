export function withRetry<T>(fn: () => Promise<T>, retries = 1): Promise<T> {
  const attempt = async (remaining: number): Promise<T> => {
    try {
      return await fn();
    } catch (error) {
      if (remaining <= 0) {
        throw error;
      }

      const delayMs = 80 + Math.floor(Math.random() * 200);
      await new Promise<void>((resolve) => {
        setTimeout(resolve, delayMs);
      });

      return attempt(remaining - 1);
    }
  };

  return attempt(retries);
}
