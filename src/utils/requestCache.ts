// Request cache to prevent duplicate API calls
interface CacheEntry {
  promise: Promise<any>
  timestamp: number
  data?: any
  error?: any
}

class RequestCache {
  private cache = new Map<string, CacheEntry>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  private getCacheKey(url: string, params: any): string {
    const sortedParams = Object.keys(params)
      .sort()
      .reduce((result, key) => {
        result[key] = params[key]
        return result
      }, {} as any)
    return `${url}:${JSON.stringify(sortedParams)}`
  }

  private isExpired(entry: CacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_DURATION
  }

  async get<T>(url: string, params: any, fetcher: () => Promise<T>): Promise<T> {
    const key = this.getCacheKey(url, params)
    const existing = this.cache.get(key)

    // Return cached data if it exists and is not expired
    if (existing && !this.isExpired(existing) && existing.data) {
      return existing.data
    }

    // Return existing promise if request is already in progress
    if (existing && existing.promise) {
      return existing.promise
    }

    // Create new request
    const promise = fetcher()
      .then(data => {
        const entry = this.cache.get(key)
        if (entry) {
          entry.data = data
          entry.error = undefined
        }
        return data
      })
      .catch(error => {
        const entry = this.cache.get(key)
        if (entry) {
          entry.error = error
          entry.data = undefined
        }
        // Remove failed requests from cache
        this.cache.delete(key)
        throw error
      })

    // Cache the promise
    this.cache.set(key, {
      promise,
      timestamp: Date.now()
    })

    return promise
  }

  clear(): void {
    this.cache.clear()
  }

  clearExpired(): void {
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key)
      }
    }
  }
}

export const requestCache = new RequestCache()

// Clear expired entries every 10 minutes
setInterval(() => {
  requestCache.clearExpired()
}, 10 * 60 * 1000)
