import type { 
  TMDBMovie, 
  TMDBTVShow, 
  TMDBKeyword, 
  TMDBMovieDetails, 
  TMDBTVDetails, 
  TMDBResponse, 
  TMDBKeywordResponse 
} from '../types/tmdb'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'

export class TMDBService {
  private apiKey: string

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  private async makeRequest<T>(endpoint: string, params: Record<string, string | number> = {}): Promise<T> {
    const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
    url.searchParams.set('api_key', this.apiKey)
    
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, String(value))
    })

    const response = await fetch(url.toString())
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
  }

  // Search for keywords
  async searchKeywords(query: string, page: number = 1): Promise<TMDBKeywordResponse> {
    return this.makeRequest<TMDBKeywordResponse>('/search/keyword', {
      query,
      page
    })
  }

  // Search for movies
  async searchMovies(query: string, page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/search/movie', {
      query,
      page
    })
  }

  // Search for TV shows
  async searchTV(query: string, page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>('/search/tv', {
      query,
      page
    })
  }

  // Get trending movies
  async getTrendingMovies(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>(`/trending/movie/${timeWindow}`, {
      page
    })
  }

  // Get trending TV shows
  async getTrendingTV(timeWindow: 'day' | 'week' = 'week', page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>(`/trending/tv/${timeWindow}`, {
      page
    })
  }

  // Get movie details
  async getMovieDetails(movieId: number): Promise<TMDBMovieDetails> {
    return this.makeRequest<TMDBMovieDetails>(`/movie/${movieId}`, {
      append_to_response: 'videos'
    })
  }

  // Get TV show details
  async getTVDetails(tvId: number): Promise<TMDBTVDetails> {
    return this.makeRequest<TMDBTVDetails>(`/tv/${tvId}`, {
      append_to_response: 'videos'
    })
  }

  // Get popular movies
  async getPopularMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/popular', {
      page
    })
  }

  // Get popular TV shows
  async getPopularTV(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>('/tv/popular', {
      page
    })
  }

  // Get top rated movies
  async getTopRatedMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/top_rated', {
      page
    })
  }

  // Get top rated TV shows
  async getTopRatedTV(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>('/tv/top_rated', {
      page
    })
  }

  // Get now playing movies
  async getNowPlayingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/now_playing', {
      page
    })
  }

  // Get airing today TV shows
  async getAiringTodayTV(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>('/tv/airing_today', {
      page
    })
  }

  // Get upcoming movies
  async getUpcomingMovies(page: number = 1): Promise<TMDBResponse<TMDBMovie>> {
    return this.makeRequest<TMDBResponse<TMDBMovie>>('/movie/upcoming', {
      page
    })
  }

  // Get on the air TV shows
  async getOnTheAirTV(page: number = 1): Promise<TMDBResponse<TMDBTVShow>> {
    return this.makeRequest<TMDBResponse<TMDBTVShow>>('/tv/on_the_air', {
      page
    })
  }

  // Filter content by release date
  filterByReleaseDate<T extends { release_date?: string; first_air_date?: string }>(
    content: T[],
    showUpcoming: boolean
  ): T[] {
    if (showUpcoming) {
      return content
    }

    const currentDate = new Date().toISOString().split('T')[0]
    
    return content.filter(item => {
      const releaseDate = item.release_date || item.first_air_date
      return releaseDate && releaseDate <= currentDate
    })
  }
}

// Create a singleton instance
let tmdbService: TMDBService | null = null

export const getTMDBService = (apiKey: string): TMDBService => {
  if (!tmdbService || tmdbService['apiKey'] !== apiKey) {
    tmdbService = new TMDBService(apiKey)
  }
  return tmdbService
}

export default TMDBService
