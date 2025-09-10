// Local storage cache for YouTube API responses
interface LocalStorageCacheEntry {
  data: any
  timestamp: number
  videoId?: string
  type: 'videoDetails' | 'relatedVideos' | 'search' | 'trending' | 'channel' | 'category' | 'query'
}

interface CacheStats {
  totalEntries: number
  expiredEntries: number
  videoEntries: number
  totalSize: string
}

class LocalStorageCache {
  private readonly CACHE_PREFIX = 'youtube_cache_'
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours
  private readonly MAX_CACHE_SIZE = 50 * 1024 * 1024 // 50MB max cache size

  private getCacheKey(type: string, videoId?: string, additionalParams?: any): string {
    const baseKey = `${this.CACHE_PREFIX}${type}`
    if (videoId) {
      return `${baseKey}_${videoId}`
    }
    if (additionalParams) {
      const sortedParams = Object.keys(additionalParams)
        .sort()
        .reduce((result, key) => {
          result[key] = additionalParams[key]
          return result
        }, {} as any)
      return `${baseKey}_${JSON.stringify(sortedParams)}`
    }
    return baseKey
  }

  private isExpired(entry: LocalStorageCacheEntry): boolean {
    return Date.now() - entry.timestamp > this.CACHE_DURATION
  }

  private getCacheSize(): number {
    let totalSize = 0
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
        }
      }
    }
    return totalSize
  }

  private clearOldestEntries(): void {
    const entries: Array<{ key: string; timestamp: number }> = []
    
    // Collect all cache entries with their timestamps
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const entry: LocalStorageCacheEntry = JSON.parse(value)
            entries.push({ key, timestamp: entry.timestamp })
          } catch (error) {
            // Remove corrupted entries
            localStorage.removeItem(key)
          }
        }
      }
    }

    // Sort by timestamp (oldest first)
    entries.sort((a, b) => a.timestamp - b.timestamp)

    // Remove oldest entries until we're under the size limit
    let currentSize = this.getCacheSize()
    for (const entry of entries) {
      if (currentSize <= this.MAX_CACHE_SIZE) break
      
      const value = localStorage.getItem(entry.key)
      if (value) {
        currentSize -= entry.key.length + value.length
        localStorage.removeItem(entry.key)
      }
    }
  }

  private setItem(key: string, data: any, type: LocalStorageCacheEntry['type'], videoId?: string): void {
    // Check cache size and clear old entries if needed
    if (this.getCacheSize() > this.MAX_CACHE_SIZE) {
      this.clearOldestEntries()
    }

    const entry: LocalStorageCacheEntry = {
      data,
      timestamp: Date.now(),
      videoId,
      type
    }

    try {
      localStorage.setItem(key, JSON.stringify(entry))
    } catch (error) {
      console.warn('Failed to save to localStorage, cache might be full:', error)
      // Try to clear some space and retry
      this.clearOldestEntries()
      try {
        localStorage.setItem(key, JSON.stringify(entry))
      } catch (retryError) {
        console.error('Failed to save to localStorage after clearing space:', retryError)
      }
    }
  }

  private getItem(key: string): LocalStorageCacheEntry | null {
    try {
      const value = localStorage.getItem(key)
      if (!value) return null

      const entry: LocalStorageCacheEntry = JSON.parse(value)
      
      if (this.isExpired(entry)) {
        localStorage.removeItem(key)
        return null
      }

      return entry
    } catch (error) {
      console.warn('Failed to parse cache entry, removing:', error)
      localStorage.removeItem(key)
      return null
    }
  }

  // Public methods
  async get<T>(
    type: LocalStorageCacheEntry['type'],
    videoId: string | undefined,
    additionalParams: any | undefined,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const key = this.getCacheKey(type, videoId, additionalParams)
    const cached = this.getItem(key)

    if (cached && cached.data) {
      console.log(`📦 Cache hit for ${type}${videoId ? ` (video: ${videoId})` : ''}`)
      return cached.data
    }

    console.log(`🌐 Cache miss for ${type}${videoId ? ` (video: ${videoId})` : ''}, fetching from API`)
    
    try {
      const data = await fetcher()
      this.setItem(key, data, type, videoId)
      return data
    } catch (error) {
      console.error(`Failed to fetch ${type}:`, error)
      throw error
    }
  }

  // Video-specific caching methods
  async getVideoDetails(videoId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get('videoDetails', videoId, undefined, fetcher)
  }

  async getRelatedVideos(videoId: string, fetcher: () => Promise<any>): Promise<any> {
    return this.get('relatedVideos', videoId, undefined, fetcher)
  }

  async getSearchResults(query: string, params: any, fetcher: () => Promise<any>): Promise<any> {
    return this.get('search', undefined, { query, ...params }, fetcher)
  }

  async getTrendingVideos(params: any, fetcher: () => Promise<any>): Promise<any> {
    return this.get('trending', undefined, params, fetcher)
  }

  async getChannelVideos(channelId: string, params: any, fetcher: () => Promise<any>): Promise<any> {
    return this.get('channel', channelId, params, fetcher)
  }

  async getCategoryVideos(categoryId: string, params: any, fetcher: () => Promise<any>): Promise<any> {
    return this.get('category', categoryId, params, fetcher)
  }

  async getQueryVideos(query: string, params: any, fetcher: () => Promise<any>): Promise<any> {
    return this.get('query', query, params, fetcher)
  }

  // Cache management
  clear(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🗑️ Cleared ${keysToRemove.length} cache entries`)
  }

  clearExpired(): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          try {
            const entry: LocalStorageCacheEntry = JSON.parse(value)
            if (this.isExpired(entry)) {
              keysToRemove.push(key)
            }
          } catch (error) {
            // Remove corrupted entries
            keysToRemove.push(key)
          }
        }
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🧹 Cleared ${keysToRemove.length} expired cache entries`)
  }

  clearVideoCache(videoId: string): void {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX) && key.includes(videoId)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
    console.log(`🎬 Cleared ${keysToRemove.length} cache entries for video ${videoId}`)
  }

  getStats(): CacheStats {
    let totalEntries = 0
    let expiredEntries = 0
    let videoEntries = 0
    let totalSize = 0

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(this.CACHE_PREFIX)) {
        const value = localStorage.getItem(key)
        if (value) {
          totalSize += key.length + value.length
          totalEntries++

          try {
            const entry: LocalStorageCacheEntry = JSON.parse(value)
            if (entry.videoId) videoEntries++
            if (this.isExpired(entry)) expiredEntries++
          } catch (error) {
            // Count corrupted entries as expired
            expiredEntries++
          }
        }
      }
    }

    return {
      totalEntries,
      expiredEntries,
      videoEntries,
      totalSize: `${(totalSize / 1024 / 1024).toFixed(2)} MB`
    }
  }

  // Auto-cleanup expired entries every hour
  startAutoCleanup(): void {
    setInterval(() => {
      this.clearExpired()
    }, 60 * 60 * 1000) // 1 hour
  }
}

export const localStorageCache = new LocalStorageCache()

// Start auto-cleanup
localStorageCache.startAutoCleanup()

// Clear expired entries on page load
localStorageCache.clearExpired()
