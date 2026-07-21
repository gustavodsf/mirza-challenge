import { ServiceUnavailableException } from "@nestjs/common";

export async function fetchJsonWithRetry<T>(url: string): Promise<T> {
    const maxAttempts = 3;
    const baseDelayMs = 300;

    let lastError: unknown;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status} for ${url}`);
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error;

        if (attempt === maxAttempts) {
          break;
        }

        const backoffMs = baseDelayMs * Math.pow(2, attempt - 1);
        await sleep(backoffMs);
      }
    }

    throw new ServiceUnavailableException({
      message: 'Failed to fetch external users API after retries',
      details: String(lastError),
    });
}

function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}