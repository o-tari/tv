import { TMDBService } from '../tmdb'

// Mock fetch
global.fetch = jest.fn()

describe('TMDBService', () => {
  let tmdbService: TMDBService

  beforeEach(() => {
    tmdbService = new TMDBService('test-api-key')
    ;(fetch as jest.Mock).mockClear()
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('filterByReleaseDate', () => {
    it('should filter out upcoming releases when showUpcoming is false', () => {
      const content = [
        { id: 1, title: 'Released Movie', release_date: '2020-01-01' },
        { id: 2, title: 'Upcoming Movie', release_date: '2030-01-01' },
        { id: 3, title: 'TV Show', first_air_date: '2020-01-01' },
        { id: 4, title: 'Upcoming TV', first_air_date: '2030-01-01' }
      ]

      const filtered = tmdbService.filterByReleaseDate(content, false)
      
      expect(filtered).toHaveLength(2)
      expect(filtered[0].title).toBe('Released Movie')
      expect(filtered[1].title).toBe('TV Show')
    })

    it('should return all content when showUpcoming is true', () => {
      const content = [
        { id: 1, title: 'Released Movie', release_date: '2020-01-01' },
        { id: 2, title: 'Upcoming Movie', release_date: '2030-01-01' }
      ]

      const filtered = tmdbService.filterByReleaseDate(content, true)
      
      expect(filtered).toHaveLength(2)
    })
  })

  describe('API calls', () => {
    it('should make correct API call for trending movies', async () => {
      const mockResponse = {
        page: 1,
        results: [],
        total_pages: 1,
        total_results: 0
      }

      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse
      })

      await tmdbService.getTrendingMovies('week', 1)

      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://api.themoviedb.org/3/trending/movie/week')
      )
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining('api_key=test-api-key')
      )
    })

    it('should handle API errors correctly', async () => {
      ;(fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      })

      await expect(tmdbService.getTrendingMovies()).rejects.toThrow(
        'TMDB API error: 401 Unauthorized'
      )
    })
  })
})
