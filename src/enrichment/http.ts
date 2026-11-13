export type Fetcher = (input: string, init?: RequestInit) => Promise<Response>

export interface EnrichmentHttpOptions {
  timeoutMs?: number
  retries?: number
  backoffMs?: number
}

export class EnrichmentHttpError extends Error {
  constructor(
    message: string,
    readonly status?: number,
  ) {
    super(message)
    this.name = 'EnrichmentHttpError'
  }
}

export class EnrichmentHttpClient {
  private readonly options: Required<EnrichmentHttpOptions>

  constructor(
    private readonly fetcher: Fetcher = fetch,
    options: EnrichmentHttpOptions = {},
  ) {
    this.options = {
      timeoutMs: options.timeoutMs ?? 10_000,
      retries: options.retries ?? 2,
      backoffMs: options.backoffMs ?? 250,
    }
  }

  async request(url: string, init?: RequestInit): Promise<Response> {
    for (let attempt = 0; ; attempt += 1) {
      try {
        const response = await this.withTimeout(url, init)
        if (response.ok) return response
        if (
          !this.isRetryable(response.status) ||
          attempt >= this.options.retries
        )
          throw new EnrichmentHttpError(
            `Enrichment source failed: HTTP ${response.status}`,
            response.status,
          )
      } catch (error) {
        if (error instanceof EnrichmentHttpError && error.status !== undefined)
          throw error
        if (attempt >= this.options.retries) throw error
      }
      await this.delay(this.options.backoffMs * 2 ** attempt)
    }
  }

  private async withTimeout(
    url: string,
    init?: RequestInit,
  ): Promise<Response> {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), this.options.timeoutMs)
    try {
      return await this.fetcher(url, { ...init, signal: controller.signal })
    } finally {
      clearTimeout(timer)
    }
  }

  private isRetryable(status: number): boolean {
    return status === 429 || status >= 500
  }

  private delay(milliseconds: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, milliseconds))
  }
}
