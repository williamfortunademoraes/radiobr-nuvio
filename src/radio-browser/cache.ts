interface CacheEntry<T> {
  value: T
  expiresAt: number
}
export class MemoryCache<T> {
  private readonly values = new Map<string, CacheEntry<T>>()
  constructor(
    private readonly ttlMs: number,
    private readonly now: () => number = Date.now,
  ) {}
  get(key: string): T | undefined {
    const entry = this.values.get(key)
    if (!entry || entry.expiresAt <= this.now()) {
      this.values.delete(key)
      return undefined
    }
    return entry.value
  }
  set(key: string, value: T): void {
    this.values.set(key, { value, expiresAt: this.now() + this.ttlMs })
  }
}
