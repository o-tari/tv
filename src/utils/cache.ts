interface CacheItem<T> {
  data: T
  timestamp: number
  expiry: number
}

interface CacheOptions {
  ttl?: number // Time to live in milliseconds
}

const DEFAULT_TTL = 15 * 60 * 1000 // 15 minutes in milliseconds

export class Cache {
  private static instance: Cache
  private cache = new Map<string, CacheItem<any>>()

  static getInstance(): Cache {
    if (!Cache.instance) {
      Cache.instance = new Cache()
    }
    return Cache.instance
  }

  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const ttl = options.ttl || DEFAULT_TTL
    const now = Date.now()
    
    this.cache.set(key, {
      data,
      timestamp: now,
      expiry: now + ttl
    })
  }

  get<T>(key: string): T | null {
    const item = this.cache.get(key)
    
    if (!item) {
      return null
    }

    const now = Date.now()
    
    if (now > item.expiry) {
      this.cache.delete(key)
      return null
    }

    return item.data as T
  }

  has(key: string): boolean {
    const item = this.cache.get(key)
    
    if (!item) {
      return false
    }

    const now = Date.now()
    
    if (now > item.expiry) {
      this.cache.delete(key)
      return false
    }

    return true
  }

  delete(key: string): boolean {
    return this.cache.delete(key)
  }

  clear(): void {
    this.cache.clear()
  }

  // Get cache info for debugging
  getInfo(): { key: string; timestamp: number; expiry: number; isExpired: boolean }[] {
    const now = Date.now()
    return Array.from(this.cache.entries()).map(([key, item]) => ({
      key,
      timestamp: item.timestamp,
      expiry: item.expiry,
      isExpired: now > item.expiry
    }))
  }
}

// Export singleton instance
export const cache = Cache.getInstance()

// Helper functions for common cache operations
export const getCachedData = <T>(key: string): T | null => {
  return cache.get<T>(key)
}

export const setCachedData = <T>(key: string, data: T, ttl?: number): void => {
  cache.set(key, data, { ttl })
}

export const isCached = (key: string): boolean => {
  return cache.has(key)
}

export const clearCache = (): void => {
  cache.clear()
}

// Cache key generators
export const getCacheKey = (prefix: string, ...params: (string | number)[]): string => {
  return `${prefix}:${params.join(':')}`
}

// YouTube-specific cache keys
export const YOUTUBE_CACHE_KEYS = {
  TRENDING: 'youtube:trending',
  CHANNELS: 'youtube:channels',
  RANDOM_VIDEOS: 'youtube:random_videos',
  SEARCH: (query: string) => `youtube:search:${query}`,
  CHANNEL_VIDEOS: (channelId: string) => `youtube:channel_videos:${channelId}`,
  CATEGORY: 'youtube:category',
  QUERY: 'youtube:query',
} as const
