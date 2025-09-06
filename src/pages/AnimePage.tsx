import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { fetchTopAiringAnime, fetchRecentEpisodes, searchAnime, clearSearchResults } from '../store/slices/animeSlice'
import { selectAnimeContinueWatching } from '../store/slices/animeContinueWatchingSlice'
import MediaGrid from '../components/MediaGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchBar from '../components/SearchBar'
import { type Anime, type AnimeEpisode, type AnimeMedia } from '../types/anime'

const AnimePage = () => {
  const dispatch = useAppDispatch()
  const {
    topAiring,
    topAiringLoading,
    topAiringError,
    topAiringNextPage,
    topAiringHasNextPage,
    recentEpisodes,
    recentEpisodesLoading,
    recentEpisodesError,
    recentEpisodesNextPage,
    recentEpisodesHasNextPage,
    searchResults,
    searchLoading,
    searchError,
    searchNextPage,
    searchHasNextPage,
  } = useAppSelector((state) => state.anime)
  
  const animeContinueWatching = useAppSelector(selectAnimeContinueWatching)

  const [activeTab, setActiveTab] = useState<'trending' | 'recent' | 'search'>('trending')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    if (topAiring.length === 0) {
      dispatch(fetchTopAiringAnime(1))
    }
  }, [dispatch, topAiring.length])

  const loadMoreTopAiring = () => {
    if (topAiringNextPage && !topAiringLoading) {
      dispatch(fetchTopAiringAnime(topAiringNextPage))
    }
  }

  const loadMoreRecent = () => {
    if (recentEpisodesNextPage && !recentEpisodesLoading) {
      dispatch(fetchRecentEpisodes({ page: recentEpisodesNextPage }))
    }
  }

  const loadMoreSearch = () => {
    if (searchNextPage && !searchLoading && searchQuery) {
      dispatch(searchAnime({ query: searchQuery, page: searchNextPage }))
    }
  }

  const handleTabChange = (tab: 'trending' | 'recent' | 'search') => {
    setActiveTab(tab)
    if (tab === 'recent' && recentEpisodes.length === 0) {
      dispatch(fetchRecentEpisodes({ page: 1 }))
    }
  }

  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setActiveTab('search')
    if (query.trim()) {
      // Clear previous search results
      dispatch(clearSearchResults())
      dispatch(searchAnime({ query: query.trim(), page: 1 }))
    } else {
      // Clear search results if query is empty
      dispatch(clearSearchResults())
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
  })

  // Convert episodes to media format for MediaGrid
  const convertEpisodeToMedia = (episode: AnimeEpisode): AnimeMedia => ({
    id: episode.episodeId,
    title: episode.title,
    image: episode.image,
    url: episode.url,
    type: 'anime',
  })

  const topAiringMedia = topAiring.map(convertAnimeToMedia)
  const recentEpisodesMedia = recentEpisodes.map(convertEpisodeToMedia)

  if (topAiringError) {
    return (
      <div className="p-8 text-center">
        <div className="w-24 h-24 mx-auto mb-4 bg-red-100 dark:bg-red-900 rounded-full flex items-center justify-center">
          <svg className="w-12 h-12 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Something went wrong
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-4">
          {topAiringError}
        </p>
        <button
          onClick={() => dispatch(fetchTopAiringAnime(1))}
          className="btn-primary"
        >
          Try again
        </button>
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Anime
        </h1>

        {/* Search Section */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Search Anime
          </h2>
          <div className="max-w-2xl">
            <SearchBar onSearch={handleSearch} />
          </div>
        </div>

        {/* Continue Watching Section */}
        {animeContinueWatching.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              ▶️ Continue Watching Anime
            </h2>
            <MediaGrid
              media={animeContinueWatching.slice(0, 8)}
              loading={false}
            />
          </div>
        )}

        {/* Tabs */}
        <div className="flex space-x-1 mb-8">
          <button
            onClick={() => handleTabChange('trending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'trending'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🔥 Top Airing
          </button>
          <button
            onClick={() => handleTabChange('recent')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === 'recent'
                ? 'bg-red-600 text-white'
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            🆕 Recent Episodes
          </button>
          {(searchQuery || searchResults.length > 0) && (
            <button
              onClick={() => handleTabChange('search')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                activeTab === 'search'
                  ? 'bg-red-600 text-white'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              🔍 Search Results
            </button>
          )}
        </div>

        {/* Content */}
        {activeTab === 'trending' ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Top Airing Anime
            </h2>
            <InfiniteScroll
              onLoadMore={loadMoreTopAiring}
              hasMore={topAiringHasNextPage}
              loading={topAiringLoading}
            >
              <MediaGrid
                media={topAiringMedia}
                loading={topAiringLoading && topAiringMedia.length === 0}
              />
            </InfiniteScroll>
          </div>
        ) : activeTab === 'recent' ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Episodes
            </h2>
            {recentEpisodesError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Failed to load recent episodes: {recentEpisodesError}
                </p>
                <button
                  onClick={() => dispatch(fetchRecentEpisodes({ page: 1 }))}
                  className="mt-4 btn-primary"
                >
                  Try again
                </button>
              </div>
            ) : (
              <InfiniteScroll
                onLoadMore={loadMoreRecent}
                hasMore={recentEpisodesHasNextPage}
                loading={recentEpisodesLoading}
              >
                <MediaGrid
                  media={recentEpisodesMedia}
                  loading={recentEpisodesLoading && recentEpisodesMedia.length === 0}
                />
              </InfiniteScroll>
            )}
          </div>
        ) : (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Search Results for "{searchQuery}"
            </h2>
            {searchError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Failed to search anime: {searchError}
                </p>
                <button
                  onClick={() => dispatch(searchAnime({ query: searchQuery, page: 1 }))}
                  className="mt-4 btn-primary"
                >
                  Try again
                </button>
              </div>
            ) : searchResults.length === 0 && !searchLoading ? (
              <div className="text-center py-8">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No anime found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try searching for a different anime title
                </p>
              </div>
            ) : (
              <InfiniteScroll
                onLoadMore={loadMoreSearch}
                hasMore={searchHasNextPage}
                loading={searchLoading}
              >
                <MediaGrid
                  media={searchResults.map(convertAnimeToMedia)}
                  loading={searchLoading && searchResults.length === 0}
                />
              </InfiniteScroll>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default AnimePage
