import { useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { searchAnime, clearSearchResults } from '../store/slices/animeSlice'
import MediaGrid from '../components/MediaGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchBar from '../components/SearchBar'
import { type Anime, type AnimeMedia } from '../types/anime'

const AnimeSearchPage = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const {
    searchResults,
    searchLoading,
    searchError,
    searchNextPage,
    searchHasNextPage,
  } = useAppSelector((state) => state.anime)

  const query = searchParams.get('search') || ''

  const handleSearch = (newQuery: string) => {
    if (newQuery.trim()) {
      navigate(`/anime/search?search=${encodeURIComponent(newQuery.trim())}`)
    }
  }

  useEffect(() => {
    if (query.trim()) {
      dispatch(clearSearchResults())
      dispatch(searchAnime({ query: query.trim(), page: 1 }))
    }
  }, [dispatch, query])

  const loadMore = () => {
    if (query && searchNextPage && !searchLoading) {
      dispatch(searchAnime({ query: query.trim(), page: searchNextPage }))
    }
  }

  // Convert anime to media format for MediaGrid
  const convertAnimeToMedia = (anime: Anime): AnimeMedia => ({
    id: anime.id,
    title: anime.title,
    image: anime.image,
    url: anime.url,
    type: 'anime',
    genres: anime.genres,
    description: anime.description,
    status: anime.status,
    totalEpisodes: anime.totalEpisodes,
    subOrDub: anime.subOrDub,
    // Jikan-specific fields
    score: anime.score,
    scoredBy: anime.scoredBy,
    rank: anime.rank,
    popularity: anime.popularity,
    members: anime.members,
    favorites: anime.favorites,
    year: anime.year,
    season: anime.season,
    duration: anime.duration,
    rating: anime.rating,
    studios: anime.studios,
    producers: anime.producers,
    otherName: anime.otherName,
    animeType: anime.type,
    releaseDate: anime.releaseDate,
  })

  const searchResultsMedia = searchResults.map(convertAnimeToMedia)

  if (searchError) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Search failed
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {searchError}
        </p>
        <button
          onClick={() => dispatch(searchAnime({ query: query.trim(), page: 1 }))}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Anime Search
        </h1>
        
        {/* Search Input */}
        <div className="max-w-2xl mb-4">
          <SearchBar onSearch={handleSearch} />
        </div>
        
        {query && (
          <>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Search Results for "{query}"
            </h2>
            {searchResults.length > 0 && (
              <p className="text-gray-600 dark:text-gray-400">
                {searchResults.length} results found
              </p>
            )}
          </>
        )}
      </div>

      {query ? (
        searchResults.length === 0 && !searchLoading ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No anime found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try searching with different keywords
            </p>
          </div>
        ) : (
          <InfiniteScroll
            onLoadMore={loadMore}
            hasMore={searchHasNextPage}
            loading={searchLoading}
          >
            <MediaGrid
              media={searchResultsMedia}
              loading={searchLoading && searchResultsMedia.length === 0}
            />
          </InfiniteScroll>
        )
      ) : (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Search Anime
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Enter a search term above to find anime
          </p>
        </div>
      )}
    </div>
  )
}

export default AnimeSearchPage
