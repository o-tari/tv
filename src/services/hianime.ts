import type { 
  HiAnimeHomeResponse, 
  HiAnimeInfoResponse, 
  HiAnimeCacheData,
  HiAnimeMedia,
  HiAnimeSpotlight,
  HiAnimeTrending,
  HiAnimeLatestEpisode,
  HiAnimeUpcoming,
  HiAnimeTop10,
  HiAnimeTopAiring,
  HiAnimeMostPopular,
  HiAnimeMostFavorite,
  HiAnimeLatestCompleted,
  HiAnimeInfo,
  HiAnimeEpisodesResponse,
  HiAnimeServersResponse,
  HiAnimeEpisodeSources
} from '../types/hianime'

const CACHE_DURATION = 60 * 60 * 1000 // 1 hour in milliseconds
const CACHE_KEY_PREFIX = 'hianime_cache_'

class HiAnimeService {
  private apiKey: string = ''
  private baseUrl = 'https://hianime.p.rapidapi.com'

  setApiKey(apiKey: string) {
    this.apiKey = apiKey
  }

  clearCache(): void {
    const keys = Object.keys(localStorage)
    keys.forEach(key => {
      if (key.startsWith(CACHE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
  }

  private getCacheKey(endpoint: string, params?: Record<string, unknown>): string {
    const paramString = params ? JSON.stringify(params) : ''
    return `${CACHE_KEY_PREFIX}${endpoint}_${paramString}`
  }

  private getCachedData<T>(cacheKey: string): T | null {
    try {
      const cached = localStorage.getItem(cacheKey)
      if (!cached) return null

      const cacheData: HiAnimeCacheData = JSON.parse(cached)
      const now = Date.now()

      if (now > cacheData.expiresAt) {
        localStorage.removeItem(cacheKey)
        return null
      }

      return cacheData.data
    } catch (error) {
      console.error('Error reading from cache:', error)
      return null
    }
  }

  private setCachedData<T>(cacheKey: string, data: T): void {
    try {
      const now = Date.now()
      const cacheData: HiAnimeCacheData = {
        data,
        timestamp: now,
        expiresAt: now + CACHE_DURATION
      }
      localStorage.setItem(cacheKey, JSON.stringify(cacheData))
    } catch (error) {
      console.error('Error writing to cache:', error)
    }
  }

  private async makeRequest<T>(endpoint: string, params?: Record<string, unknown>): Promise<T> {
    if (!this.apiKey) {
      throw new Error('HiAnime API key is not set')
    }

    const cacheKey = this.getCacheKey(endpoint, params)
    const cachedData = this.getCachedData<T>(cacheKey)
    
    if (cachedData) {
      return cachedData
    }

    const url = new URL(`${this.baseUrl}${endpoint}`)
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        url.searchParams.append(key, String(value))
      })
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'x-rapidapi-host': 'hianime.p.rapidapi.com',
        'x-rapidapi-key': this.apiKey,
      },
    })

    if (!response.ok) {
      throw new Error(`HiAnime API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()
    this.setCachedData(cacheKey, data)
    return data
  }

  async getHomeData(): Promise<HiAnimeHomeResponse> {
    const response = await this.makeRequest<{success: boolean, data: HiAnimeHomeResponse}>('/anime/home')
    return response.data
  }

  async getAnimeInfo(id: string): Promise<HiAnimeInfoResponse> {
    const response = await this.makeRequest<{success: boolean, data: HiAnimeInfoResponse}>('/anime/info', { id })
    return response.data
  }

  async getAnimeEpisodes(animeId: string): Promise<HiAnimeEpisodesResponse> {
    const response = await this.makeRequest<{success: boolean, data: HiAnimeEpisodesResponse}>(`/anime/episodes/${animeId}`)
    return response.data
  }

  async getEpisodeServers(episodeId: string): Promise<HiAnimeServersResponse> {
    const response = await this.makeRequest<{success: boolean, data: HiAnimeServersResponse}>('/anime/servers', { episodeId })
    return response.data
  }

  async getEpisodeSources(episodeId: string, serverId: number, category: 'sub' | 'dub' = 'sub'): Promise<HiAnimeEpisodeSources> {
    const serverName = this.getServerName(serverId)
    const response = await this.makeRequest<{
      success: boolean
      data: HiAnimeEpisodeSources
    }>('/anime/episode-srcs', { 
      id: episodeId, 
      server: serverName, 
      category 
    })
    return response.data
  }

  async getEpisodeStreamingUrl(episodeId: string, serverId: number, category: 'sub' | 'dub' = 'sub'): Promise<{ url: string; isEmbed: boolean; sources?: HiAnimeEpisodeSources }> {
    // First try to get actual streaming sources
    try {
      const sources = await this.getEpisodeSources(episodeId, serverId, category)
      if (sources.sources && sources.sources.length > 0) {
        // For iframe embedding, we'll use the HiAnime embed URL instead of direct streaming
        // This provides better compatibility and controls
        const cleanEpisodeId = episodeId.replace(/\?ep=\d+/, '')
        const serverName = this.getServerName(serverId)
        const episodeNumber = this.extractEpisodeNumber(episodeId)
        
        const embedUrl = `https://hianime.to/embed/${cleanEpisodeId}?ep=${episodeNumber}&server=${serverName}&category=${category}`
        
        console.log('Created HiAnime embed URL with sources data:', embedUrl)
        return { 
          url: embedUrl, 
          isEmbed: true,
          sources: sources // Include sources data for additional info
        }
      }
    } catch (error) {
      console.warn('Failed to get episode sources, falling back to embed URL:', error)
    }
    
    // Fallback to embed URL if sources API fails
    const cleanEpisodeId = episodeId.replace(/\?ep=\d+/, '')
    const serverName = this.getServerName(serverId)
    const episodeNumber = this.extractEpisodeNumber(episodeId)
    
    const embedUrl = `https://hianime.to/embed/${cleanEpisodeId}?ep=${episodeNumber}&server=${serverName}&category=${category}`
    
    console.log('Created HiAnime embed URL (fallback):', embedUrl)
    return { url: embedUrl, isEmbed: true }
  }

  private getServerName(serverId: number): string {
    const serverMap: { [key: number]: string } = {
      1: 'hd-2',
      4: 'hd-1', 
      6: 'hd-3'
    }
    return serverMap[serverId] || 'hd-1'
  }

  private extractEpisodeNumber(episodeId: string): string {
    const match = episodeId.match(/\?ep=(\d+)/)
    return match ? match[1] : '1'
  }

  // Convert HiAnime data to unified media format
  convertSpotlightToMedia(spotlight: HiAnimeSpotlight): HiAnimeMedia {
    return {
      id: spotlight.id,
      title: spotlight.name,
      image: spotlight.poster,
      url: `/hianime/${spotlight.id}`,
      type: 'hianime',
      description: spotlight.description,
      jname: spotlight.jname,
      rank: spotlight.rank,
      episodes: spotlight.episodes,
      otherInfo: spotlight.otherInfo,
      totalEpisodes: spotlight.episodes.sub || spotlight.episodes.dub || 0,
      subOrDub: spotlight.episodes.sub ? 'sub' : 'dub',
      animeType: spotlight.otherInfo?.[0] || 'TV',
      duration: spotlight.otherInfo?.[1] || '24m',
      rating: spotlight.otherInfo?.[3] || 'HD'
    }
  }

  convertTrendingToMedia(trending: HiAnimeTrending): HiAnimeMedia {
    return {
      id: trending.id,
      title: trending.name,
      image: trending.poster,
      url: `/hianime/${trending.id}`,
      type: 'hianime',
      rank: trending.rank
    }
  }

  convertLatestEpisodeToMedia(episode: HiAnimeLatestEpisode): HiAnimeMedia {
    return {
      id: episode.id,
      title: episode.name,
      image: episode.poster,
      url: `/hianime/${episode.id}`,
      type: 'hianime',
      duration: episode.duration,
      animeType: episode.type,
      rating: episode.rating || undefined,
      episodes: episode.episodes,
      totalEpisodes: episode.episodes.sub || episode.episodes.dub || 0,
      subOrDub: episode.episodes.sub ? 'sub' : 'dub'
    }
  }

  convertUpcomingToMedia(upcoming: HiAnimeUpcoming): HiAnimeMedia {
    return {
      id: upcoming.id,
      title: upcoming.name,
      image: upcoming.poster,
      url: `/hianime/${upcoming.id}`,
      type: 'hianime',
      duration: upcoming.duration,
      animeType: upcoming.type,
      rating: upcoming.rating || undefined,
      episodes: upcoming.episodes,
      totalEpisodes: upcoming.episodes.sub || upcoming.episodes.dub || 0,
      subOrDub: upcoming.episodes.sub ? 'sub' : 'dub'
    }
  }

  convertTop10ToMedia(top10: HiAnimeTop10): HiAnimeMedia {
    return {
      id: top10.id,
      title: top10.name,
      image: top10.poster,
      url: `/hianime/${top10.id}`,
      type: 'hianime',
      rank: top10.rank,
      episodes: top10.episodes,
      totalEpisodes: top10.episodes.sub || top10.episodes.dub || 0,
      subOrDub: top10.episodes.sub ? 'sub' : 'dub'
    }
  }

  convertTopAiringToMedia(airing: HiAnimeTopAiring): HiAnimeMedia {
    return {
      id: airing.id,
      title: airing.name,
      image: airing.poster,
      url: `/hianime/${airing.id}`,
      type: 'hianime',
      description: '',
      jname: airing.jname,
      otherInfo: airing.otherInfo,
      animeType: airing.otherInfo?.[0] || 'TV',
      totalEpisodes: 0,
      subOrDub: 'sub',
      episodes: { sub: 0, dub: 0 },
      anilistId: undefined,
      malId: undefined,
      duration: undefined,
      rating: undefined
    }
  }

  convertInfoToMedia(info: HiAnimeInfo): HiAnimeMedia {
    return {
      id: info.id,
      title: info.name,
      image: info.poster,
      url: `/hianime/${info.id}`,
      type: 'hianime',
      description: info.description,
      anilistId: info.anilistId,
      malId: info.malId,
      episodes: info.stats.episodes,
      totalEpisodes: info.stats.episodes.sub || info.stats.episodes.dub || 0,
      subOrDub: info.stats.episodes.sub ? 'sub' : 'dub',
      animeType: info.stats.type,
      duration: info.stats.duration,
      rating: info.stats.rating
    }
  }

  convertMostPopularToMedia(popular: HiAnimeMostPopular): HiAnimeMedia {
    return {
      id: popular.id,
      title: popular.name,
      image: popular.poster,
      url: `/hianime/${popular.id}`,
      type: 'hianime',
      description: '',
      anilistId: undefined,
      malId: undefined,
      episodes: popular.episodes,
      totalEpisodes: popular.episodes.sub || popular.episodes.dub || 0,
      subOrDub: popular.episodes.sub ? 'sub' : 'dub',
      animeType: popular.type,
      duration: undefined,
      rating: undefined
    }
  }

  convertMostFavoriteToMedia(favorite: HiAnimeMostFavorite): HiAnimeMedia {
    return {
      id: favorite.id,
      title: favorite.name,
      image: favorite.poster,
      url: `/hianime/${favorite.id}`,
      type: 'hianime',
      description: '',
      anilistId: undefined,
      malId: undefined,
      episodes: favorite.episodes,
      totalEpisodes: favorite.episodes.sub || favorite.episodes.dub || 0,
      subOrDub: favorite.episodes.sub ? 'sub' : 'dub',
      animeType: favorite.type,
      duration: undefined,
      rating: undefined
    }
  }

  convertLatestCompletedToMedia(completed: HiAnimeLatestCompleted): HiAnimeMedia {
    return {
      id: completed.id,
      title: completed.name,
      image: completed.poster,
      url: `/hianime/${completed.id}`,
      type: 'hianime',
      description: '',
      anilistId: undefined,
      malId: undefined,
      episodes: completed.episodes,
      totalEpisodes: completed.episodes.sub || completed.episodes.dub || 0,
      subOrDub: completed.episodes.sub ? 'sub' : 'dub',
      animeType: completed.type,
      duration: undefined,
      rating: undefined
    }
  }

  // Get cache info
  getCacheInfo(): { totalKeys: number; expiredKeys: number } {
    try {
      const keys = Object.keys(localStorage)
      const cacheKeys = keys.filter(key => key.startsWith(CACHE_KEY_PREFIX))
      let expiredKeys = 0
      const now = Date.now()

      cacheKeys.forEach(key => {
        try {
          const cached = localStorage.getItem(key)
          if (cached) {
            const cacheData: HiAnimeCacheData = JSON.parse(cached)
            if (now > cacheData.expiresAt) {
              expiredKeys++
            }
          }
        } catch {
          expiredKeys++
        }
      })

      return {
        totalKeys: cacheKeys.length,
        expiredKeys
      }
    } catch (error) {
      console.error('Error getting cache info:', error)
      return { totalKeys: 0, expiredKeys: 0 }
    }
  }
}

export const hianimeService = new HiAnimeService()
