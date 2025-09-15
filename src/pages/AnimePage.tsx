import { useEffect, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { 
  fetchTopAiringAnime, 
  fetchRecentEpisodes, 
  searchAnime, 
  clearSearchResults,
  fetchTopAnime
} from '../store/slices/animeSlice'
import MediaGrid from '../components/MediaGrid'
import InfiniteScroll from '../components/InfiniteScroll'
import SearchBar from '../components/SearchBar'
import AnimeContinueWatching from '../components/AnimeContinueWatching'
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
    // Jikan API data
    topAnime,
    topAnimeLoading,
    topAnimeError,
    topAnimeNextPage,
    topAnimeHasNextPage,
    recommendations,
    recommendationsLoading,
    recommendationsError,
  } = useAppSelector((state) => state.anime)
  

  const [activeTab, setActiveTab] = useState<'trending' | 'recent'>('trending')

  useEffect(() => {
    if (topAiring.length === 0) {
      dispatch(fetchTopAiringAnime(1))
    }
    if (topAnime.length === 0) {
      dispatch(fetchTopAnime({ page: 1, filter: 'bypopularity' }))
    }
  }, [dispatch, topAiring.length, topAnime.length])

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

  const loadMoreTopAnime = () => {
    if (topAnimeNextPage && !topAnimeLoading) {
      dispatch(fetchTopAnime({ page: topAnimeNextPage, filter: 'bypopularity' }))
    }
  }


  const handleTabChange = (tab: 'trending' | 'recent') => {
    setActiveTab(tab)
    if (tab === 'recent' && recentEpisodes.length === 0) {
      dispatch(fetchRecentEpisodes({ page: 1 }))
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
  const topAnimeMedia = topAnime.map(convertAnimeToMedia)
  const recommendationsMedia = recommendations.map(convertAnimeToMedia)

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
            <SearchBar searchPath="/anime/search" />
          </div>
        </div>

        {/* Continue Watching Section */}
        <AnimeContinueWatching limit={8} />

        {/* Top Anime Section (Jikan API) */}
        <div className="mb-8">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
 Top Anime
          </h2>
          {topAnimeError ? (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">
                Failed to load top anime: {topAnimeError}
              </p>
              <button
                onClick={() => dispatch(fetchTopAnime({ page: 1, filter: 'bypopularity' }))}
                className="mt-4 btn-primary"
              >
                Try again
              </button>
            </div>
          ) : (
            <InfiniteScroll
              onLoadMore={loadMoreTopAnime}
              hasMore={topAnimeHasNextPage}
              loading={topAnimeLoading}
            >
              <MediaGrid
                media={topAnimeMedia}
                loading={topAnimeLoading && topAnimeMedia.length === 0}
              />
            </InfiniteScroll>
          )}
        </div>

        {/* Recommendations Section (Jikan API) */}
        {recommendations.length > 0 && (
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              💡 Recommendations
            </h2>
            {recommendationsError ? (
              <div className="text-center py-8">
                <p className="text-red-600 dark:text-red-400">
                  Failed to load recommendations: {recommendationsError}
                </p>
              </div>
            ) : (
              <MediaGrid
                media={recommendationsMedia.slice(0, 12)}
                loading={recommendationsLoading}
              />
            )}
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
 Top Airing
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
        </div>

        {/* Tab Content */}
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
        ) : null}
      </div>
    </div>
  )
}

export default AnimePage
