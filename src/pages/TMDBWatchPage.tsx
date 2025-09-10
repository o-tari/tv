import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector, useAppDispatch } from '../store'
import { selectTmdbApiKey } from '../store/slices/settingsSlice'
import { addTVToContinueWatching } from '../store/slices/tmdbContinueWatchingSlice'
import { getTMDBService } from '../services/tmdb'
import { torrentSearchService } from '../services/torrentSearch'
import type { TMDBMovieDetails, TMDBTVDetails, TMDBVideo, TMDBEpisode } from '../types/tmdb'
import type { ApiTorrentSearchResponse } from '../types/torrent'
import TorrentPlayer from '../components/TorrentPlayer'
import TorrentsTable from '../components/TorrentsTable'
import LoadingSpinner from '../components/LoadingSpinner'

const TMDBWatchPage = () => {
  const { id, type } = useParams<{ id: string; type: 'movie' | 'tv' }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const tmdbApiKey = useAppSelector(selectTmdbApiKey)
  
  const [content, setContent] = useState<TMDBMovieDetails | TMDBTVDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedSeason, setSelectedSeason] = useState<number>(1)
  const [episodes, setEpisodes] = useState<TMDBEpisode[]>([])
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [selectedEpisode, setSelectedEpisode] = useState<TMDBEpisode | null>(null)
  const [torrentResults, setTorrentResults] = useState<ApiTorrentSearchResponse | null>(null)
  const [torrentLoading, setTorrentLoading] = useState(false)

  useEffect(() => {
    if (id && type && tmdbApiKey) {
      loadContent()
    }
  }, [id, type, tmdbApiKey])

  // Load saved episode selection from localStorage
  useEffect(() => {
    if (id && type === 'tv' && tmdbApiKey && content) {
      const savedEpisode = localStorage.getItem(`tmdb-tv-${id}-selected-episode`)
      if (savedEpisode) {
        try {
          const episodeData = JSON.parse(savedEpisode)
          setSelectedEpisode(episodeData)
          // Also set the season if we have a saved episode
          if (episodeData.season_number) {
            setSelectedSeason(episodeData.season_number)
            // Load episodes for the saved season
            loadEpisodes(episodeData.season_number)
          }
        } catch (error) {
          console.error('Error parsing saved episode data:', error)
        }
      }
    }
  }, [id, type, tmdbApiKey, content])

  const loadContent = async () => {
    if (!id || !type || !tmdbApiKey) return

    console.log('🎬 TMDBWatchPage: Loading content...', { id, type })
    setLoading(true)
    setError(null)
    
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      
      if (type === 'movie') {
        console.log('🎬 Loading movie details for ID:', id)
        const movieDetails = await tmdbService.getMovieDetails(parseInt(id))
        console.log('🎬 Movie loaded:', { title: movieDetails.title, year: movieDetails.release_date })
        setContent(movieDetails)
      } else {
        console.log('📺 Loading TV details for ID:', id)
        const tvDetails = await tmdbService.getTVDetails(parseInt(id))
        console.log('📺 TV show loaded:', { name: tvDetails.name, seasons: tvDetails.seasons?.length })
        setContent(tvDetails)
        // Set first season as default
        if (tvDetails.seasons && tvDetails.seasons.length > 0) {
          setSelectedSeason(tvDetails.seasons[0].season_number)
          // Load episodes for the first season
          loadEpisodes(tvDetails.seasons[0].season_number)
        }
      }
    } catch (err) {
      console.error('❌ Error loading content:', err)
      setError('Failed to load content details')
    } finally {
      setLoading(false)
    }
  }

  const loadEpisodes = async (seasonNumber: number) => {
    if (!id || !tmdbApiKey || type !== 'tv') return

    console.log('📺 Loading episodes for season:', seasonNumber)
    setEpisodesLoading(true)
    try {
      const tmdbService = getTMDBService(tmdbApiKey)
      const seasonDetails = await tmdbService.getSeasonDetails(parseInt(id), seasonNumber)
      console.log('📺 Episodes loaded:', seasonDetails.episodes?.length || 0)
      setEpisodes(seasonDetails.episodes || [])
      
      // If we have a saved episode and it's in this season, select it
      if (selectedEpisode && selectedEpisode.season_number === seasonNumber) {
        const savedEpisode = seasonDetails.episodes?.find(
          ep => ep.episode_number === selectedEpisode.episode_number
        )
        if (savedEpisode) {
          console.log('📺 Restored saved episode:', savedEpisode.name)
          setSelectedEpisode(savedEpisode)
        }
      }
    } catch (err) {
      console.error('❌ Error loading episodes:', err)
      setEpisodes([])
    } finally {
      setEpisodesLoading(false)
    }
  }

  const handleSeasonSelect = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber)
    loadEpisodes(seasonNumber)
  }

  const handleEpisodeSelect = (episode: TMDBEpisode) => {
    console.log('📺 Episode selected:', { 
      name: episode.name, 
      season: episode.season_number, 
      episode: episode.episode_number 
    })
    setSelectedEpisode(episode)
    // Save to localStorage
    if (id && type === 'tv') {
      localStorage.setItem(`tmdb-tv-${id}-selected-episode`, JSON.stringify(episode))
      console.log('📺 Episode saved to localStorage')
    }
    
    // Add to continue watching
    if (content && type === 'tv') {
      dispatch(addTVToContinueWatching({
        content,
        type: 'tv'
      }))
      console.log('📺 Added to continue watching')
    }

    // Search for torrents for this episode
    if (content && type === 'tv') {
      searchForEpisodeTorrents(content as TMDBTVDetails, episode)
    }
  }

  const searchForEpisodeTorrents = async (show: TMDBTVDetails, episode: TMDBEpisode) => {
    try {
      setTorrentLoading(true)
      console.log('🔍 Searching for episode torrents:', {
        show: show.name,
        season: episode.season_number,
        episode: episode.episode_number,
        totalEpisodes: show.number_of_episodes,
        genres: show.genres.map(g => g.name)
      })

      // Check if this is a long-running animation (100+ episodes with Animation genre)
      const isAnimation = show.genres.some(genre => 
        genre.name.toLowerCase().includes('animation') || 
        genre.name.toLowerCase().includes('anime')
      )
      const isLongRunning = show.number_of_episodes > 100
      
      console.log('🔍 Show analysis:', {
        isAnimation,
        isLongRunning,
        totalEpisodes: show.number_of_episodes,
        genres: show.genres.map(g => g.name)
      })

      let results: ApiTorrentSearchResponse

      if (isAnimation && isLongRunning) {
        // For long-running animations like One Piece, use just episode number
        const searchQuery = `${show.name} ${episode.episode_number}`
        console.log('🔍 Long-running animation search query:', searchQuery)
        console.log('🔍 Using format: "Show Name EpisodeNumber" (no season)')
        
        // Use the general search method instead of TV-specific search
        results = await torrentSearchService.searchTorrents({
          site: 'piratebay',
          query: searchQuery
        })
      } else {
        // For regular TV shows, use season/episode format
        const seasonStr = episode.season_number.toString().padStart(2, '0')
        const episodeStr = episode.episode_number.toString().padStart(2, '0')
        const searchQuery = `${show.name} s${seasonStr}e${episodeStr}`
        console.log('🔍 Regular TV show search query:', searchQuery)
        console.log('🔍 Using format: "Show Name S##E##" (with season)')
        
        results = await torrentSearchService.searchTVTorrents(
          show.name,
          episode.season_number,
          episode.episode_number,
          'piratebay'
        )
      }
      
      console.log('🔍 Torrent search results:', results)
      setTorrentResults(results)
    } catch (error) {
      console.error('❌ Error searching for episode torrents:', error)
      setTorrentResults(null)
    } finally {
      setTorrentLoading(false)
    }
  }

  const getTrailerVideo = (): TMDBVideo | null => {
    if (!content?.videos?.results) return null
    
    const trailers = content.videos.results.filter(
      video => video.type === 'Trailer' && video.site === 'YouTube'
    )
    
    return trailers.length > 0 ? trailers[0] : null
  }


  const formatRuntime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const generateExternalLink = (): string => {
    if (!content) return ''
    
    if (type === 'tv' && selectedEpisode) {
      // For TV shows: https://1337x.to/search/avatar+the+last+airbender+s01e01/1/
      const title = (content as TMDBTVDetails).name
      const seasonNum = selectedEpisode.season_number.toString().padStart(2, '0')
      const episodeNum = selectedEpisode.episode_number.toString().padStart(2, '0')
      // Convert title to lowercase and replace spaces/special chars with +
      const searchTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '+').replace(/\++/g, '+')
      const searchQuery = `${searchTitle}+s${seasonNum}e${episodeNum}`
      return `https://1337x.to/search/${searchQuery}/1/`
    } else if (type === 'movie') {
      // For movies: https://1337x.to/search/blade+runner/1/
      const title = (content as TMDBMovieDetails).title
      // Convert title to lowercase and replace spaces/special chars with +
      const searchTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '+').replace(/\++/g, '+')
      return `https://1337x.to/search/${searchTitle}/1/`
    }
    
    return ''
  }

  const generateGeneralExternalLink = (): string => {
    if (!content) return ''
    
    if (type === 'tv') {
      // For TV shows general search: https://1337x.to/search/avatar+the+last+airbender/1/
      const title = (content as TMDBTVDetails).name
      // Convert title to lowercase and replace spaces/special chars with +
      const searchTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '+').replace(/\++/g, '+')
      return `https://1337x.to/search/${searchTitle}/1/`
    } else if (type === 'movie') {
      // For movies: https://1337x.to/search/blade+runner/1/
      const title = (content as TMDBMovieDetails).title
      // Convert title to lowercase and replace spaces/special chars with +
      const searchTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '+').replace(/\++/g, '+')
      return `https://1337x.to/search/${searchTitle}/1/`
    }
    
    return ''
  }

  const generateSeasonExternalLink = (seasonNumber: number): string => {
    if (!content || type !== 'tv') return ''
    
    // For TV show seasons: https://1337x.to/search/avatar+the+last+airbender+s01/1/
    const title = (content as TMDBTVDetails).name
    const seasonNum = seasonNumber.toString().padStart(2, '0')
    // Convert title to lowercase and replace spaces/special chars with +
    const searchTitle = title.toLowerCase().replace(/[^a-z0-9]/g, '+').replace(/\++/g, '+')
    const searchQuery = `${searchTitle}+s${seasonNum}`
    return `https://1337x.to/search/${searchQuery}/1/`
  }

  if (!tmdbApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              TMDB API Key Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 text-lg mb-8">
              Please configure your TMDB API key in settings to watch content.
            </p>
            <button
              onClick={() => navigate('/settings')}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Go to Settings
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (error || !content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {error || 'Content not found'}
            </h1>
            <button
              onClick={() => navigate('/movies-tv')}
              className="inline-flex items-center px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors"
            >
              Back to Movies & TV
            </button>
          </div>
        </div>
      </div>
    )
  }

  const trailer = getTrailerVideo()
  const isTV = type === 'tv'

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate('/movies-tv')}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Movies & TV
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Video Player */}
            <div className="mb-6">
              {(() => {
                if (isTV && selectedEpisode) {
                  console.log('🎬 TMDBWatchPage: Rendering TorrentPlayer for TV show', {
                    showTitle: (content as TMDBTVDetails).name,
                    season: selectedEpisode.season_number,
                    episode: selectedEpisode.episode_number,
                    youtubeVideoId: trailer?.key
                  })
                  return (
                    <TorrentPlayer
                      showTitle={(content as TMDBTVDetails).name}
                      season={selectedEpisode.season_number}
                      episode={selectedEpisode.episode_number}
                      youtubeVideoId={trailer?.key}
                    />
                  )
                } else if (!isTV) {
                  console.log('🎬 TMDBWatchPage: Rendering TorrentPlayer for movie', {
                    movieTitle: (content as TMDBMovieDetails).title,
                    youtubeVideoId: trailer?.key
                  })
                  return (
                    <TorrentPlayer
                      movieTitle={(content as TMDBMovieDetails).title}
                      youtubeVideoId={trailer?.key}
                    />
                  )
                } else {
                  return (
                    <div className="bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center">
                      <div className="text-center">
                        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
                          Select an episode to watch
                        </p>
                        <div className="w-16 h-16 mx-auto bg-gray-300 dark:bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-500 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )
                }
              })()}
            </div>

            {/* Content Details */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                {isTV ? (content as TMDBTVDetails).name : (content as TMDBMovieDetails).title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-4 mb-4">
                <div className="flex items-center">
                  <span className="text-yellow-500 mr-1">★</span>
                  <span className="text-gray-900 dark:text-white font-semibold">
                    {content.vote_average.toFixed(1)}
                  </span>
                  <span className="text-gray-500 dark:text-gray-400 ml-1">
                    ({content.vote_count} votes)
                  </span>
                </div>
                
                {isTV && 'number_of_seasons' in content && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {content.number_of_seasons} season{content.number_of_seasons !== 1 ? 's' : ''}
                  </span>
                )}
                
                {!isTV && 'runtime' in content && (
                  <span className="text-gray-500 dark:text-gray-400">
                    {formatRuntime(content.runtime)}
                  </span>
                )}
                
                <span className="text-gray-500 dark:text-gray-400">
                  {formatDate(isTV ? (content as TMDBTVDetails).first_air_date : (content as TMDBMovieDetails).release_date)}
                </span>
              </div>

              <div className="flex flex-wrap gap-2 mb-6">
                {content.genres.map((genre) => (
                  <span
                    key={genre.id}
                    className="px-3 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                {content.overview}
              </p>
            </div>

            {/* Selected Episode Details */}
            {isTV && selectedEpisode && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                    Selected Episode
                  </h2>
                  
                  {/* External Link for Selected Episode */}
                  <a
                    href={generateExternalLink()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                    title={`Search for ${(content as TMDBTVDetails).name} S${selectedEpisode.season_number.toString().padStart(2, '0')}E${selectedEpisode.episode_number.toString().padStart(2, '0')} on 1337x`}
                  >
                    <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
                
                <div className="flex items-start space-x-4">
                  {selectedEpisode.still_path && (
                    <div className="flex-shrink-0">
                      <img
                        src={`https://image.tmdb.org/t/p/w300${selectedEpisode.still_path}`}
                        alt={selectedEpisode.name}
                        className="w-32 h-20 object-cover rounded-lg"
                      />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedEpisode.name}
                      </h3>
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded text-sm font-medium">
                        S{selectedEpisode.season_number}E{selectedEpisode.episode_number}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-4 mb-3 text-sm text-gray-500 dark:text-gray-400">
                      {selectedEpisode.air_date && (
                        <span>{formatDate(selectedEpisode.air_date)}</span>
                      )}
                      {selectedEpisode.vote_average > 0 && (
                        <div className="flex items-center">
                          <span className="text-yellow-500 mr-1">★</span>
                          <span>{selectedEpisode.vote_average.toFixed(1)}</span>
                          <span className="ml-1">({selectedEpisode.vote_count} votes)</span>
                        </div>
                      )}
                    </div>
                    
                    {selectedEpisode.overview && (
                      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                        {selectedEpisode.overview}
                      </p>
                    )}
                  </div>
                </div>

                {/* Torrents Table for Selected Episode */}
                {torrentLoading ? (
                  <div className="mt-6 flex items-center justify-center py-8">
                    <LoadingSpinner />
                    <span className="ml-3 text-gray-600 dark:text-gray-400">
                      Searching for torrents...
                    </span>
                  </div>
                ) : (
                  <div className="mt-6">
                    <TorrentsTable 
                      searchResults={torrentResults}
                      selectedTorrent={null}
                      onTorrentSelect={(torrent) => {
                        console.log('🎬 Torrent selected:', torrent.name)
                      }}
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* TV Show Seasons & Episodes */}
            {isTV && 'seasons' in content && content.seasons && (
              <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Seasons & Episodes
                </h3>
                
                <div className="space-y-4">
                  {content.seasons.map((season) => (
                    <div key={season.id}>
                      <div className={`p-3 rounded-lg transition-colors ${
                        selectedSeason === season.season_number
                          ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                      }`}>
                        <div className="flex items-center justify-between mb-2">
                          <button
                            onClick={() => handleSeasonSelect(season.season_number)}
                            className="flex-1 text-left hover:opacity-80 transition-opacity"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-semibold">
                                Season {season.season_number}
                              </span>
                              <span className="text-sm text-gray-500 dark:text-gray-400">
                                {season.episode_count} episodes
                              </span>
                            </div>
                            {season.air_date && (
                              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                {formatDate(season.air_date)}
                              </p>
                            )}
                          </button>
                          
                          {/* External Link for Season */}
                          <a
                            href={generateSeasonExternalLink(season.season_number)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-3 inline-flex items-center justify-center w-8 h-8 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded-lg transition-colors"
                            title={`Search for Season ${season.season_number} on 1337x`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <svg className="w-4 h-4 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                      
                      {selectedSeason === season.season_number && (
                        <div className="mt-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                          {episodesLoading ? (
                            <div className="flex items-center justify-center py-4">
                              <LoadingSpinner />
                            </div>
                          ) : episodes.length > 0 ? (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                                Episodes ({episodes.length})
                              </h4>
                              {episodes.map((episode) => (
                                <button
                                  key={episode.id}
                                  onClick={() => handleEpisodeSelect(episode)}
                                  className={`w-full flex items-start space-x-3 p-2 rounded transition-colors ${
                                    selectedEpisode?.id === episode.id
                                      ? 'bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700'
                                      : 'hover:bg-gray-100 dark:hover:bg-gray-600'
                                  }`}
                                >
                                  <div className={`flex-shrink-0 w-8 h-8 rounded flex items-center justify-center text-sm font-medium ${
                                    selectedEpisode?.id === episode.id
                                      ? 'bg-red-500 text-white'
                                      : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'
                                  }`}>
                                    {episode.episode_number}
                                  </div>
                                  <div className="flex-1 min-w-0 text-left">
                                    <h5 className={`text-sm font-medium truncate ${
                                      selectedEpisode?.id === episode.id
                                        ? 'text-red-600 dark:text-red-400'
                                        : 'text-gray-900 dark:text-white'
                                    }`}>
                                      {episode.name}
                                    </h5>
                                    {episode.air_date && (
                                      <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {formatDate(episode.air_date)}
                                      </p>
                                    )}
                                    {episode.overview && (
                                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 line-clamp-2">
                                        {episode.overview}
                                      </p>
                                    )}
                                    {episode.vote_average > 0 && (
                                      <div className="flex items-center mt-1">
                                        <span className="text-yellow-500 text-xs mr-1">★</span>
                                        <span className="text-xs text-gray-500 dark:text-gray-400">
                                          {episode.vote_average.toFixed(1)}
                                        </span>
                                      </div>
                                    )}
                                  </div>
                                </button>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                              No episodes available
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Content Poster */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <div className="flex justify-center mb-4">
                <img
                  src={`https://image.tmdb.org/t/p/w500${content.poster_path}`}
                  alt={isTV ? (content as TMDBTVDetails).name : (content as TMDBMovieDetails).title}
                  className="w-full max-w-xs rounded-lg shadow-lg"
                />
              </div>
              
              {/* External Link for Content */}
              <div className="flex justify-end">
                <a
                  href={generateGeneralExternalLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title={`Search for ${isTV ? (content as TMDBTVDetails).name : (content as TMDBMovieDetails).title} on 1337x`}
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Additional Info */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                Additional Info
              </h3>
              
              <div className="space-y-3">
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Status</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {content.status}
                  </p>
                </div>
                
                <div>
                  <span className="text-gray-500 dark:text-gray-400 text-sm">Language</span>
                  <p className="text-gray-900 dark:text-white font-medium">
                    {content.original_language.toUpperCase()}
                  </p>
                </div>
                
                {isTV && 'origin_country' in content && content.origin_country.length > 0 && (
                  <div>
                    <span className="text-gray-500 dark:text-gray-400 text-sm">Country</span>
                    <p className="text-gray-900 dark:text-white font-medium">
                      {content.origin_country.join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default TMDBWatchPage
