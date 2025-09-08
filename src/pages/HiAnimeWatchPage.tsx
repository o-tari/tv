import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store'
import { selectHianimeApiKey } from '../store/slices/settingsSlice'
import { 
  addToHiAnimeContinueWatching, 
  saveHiAnimeEpisodeProgress
} from '../store/slices/hianimeContinueWatchingSlice'
import { hianimeService } from '../services/hianime'
import type { 
  HiAnimeInfoResponse, 
  HiAnimeEpisodesResponse, 
  HiAnimeServersResponse,
  HiAnimeEpisode,
  HiAnimeServer
} from '../types/hianime'
import MediaGrid from '../components/MediaGrid'

const HiAnimeWatchPage = () => {
  const { animeId } = useParams<{ animeId: string }>()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  
  // State for anime info
  const [animeInfo, setAnimeInfo] = useState<HiAnimeInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // State for episodes
  const [episodes, setEpisodes] = useState<HiAnimeEpisodesResponse | null>(null)
  const [episodesLoading, setEpisodesLoading] = useState(false)
  const [episodesError, setEpisodesError] = useState<string | null>(null)
  
  // State for current episode and servers
  const [selectedEpisode, setSelectedEpisode] = useState<HiAnimeEpisode | null>(null)
  const [servers, setServers] = useState<HiAnimeServersResponse | null>(null)
  const [serversLoading, setServersLoading] = useState(false)
  const [serversError, setServersError] = useState<string | null>(null)
  const [selectedServer, setSelectedServer] = useState<HiAnimeServer | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'sub' | 'dub'>('sub')
  const [streamingUrl, setStreamingUrl] = useState<string | null>(null)
  const [streamingUrlLoading, setStreamingUrlLoading] = useState(false)
  const [streamingUrlError, setStreamingUrlError] = useState<string | null>(null)

  useEffect(() => {
    if (!animeId) {
      navigate('/hianime')
      return
    }

    if (!hianimeApiKey) {
      setError('HiAnime API key is not configured. Please add your API key in Settings.')
      setLoading(false)
      return
    }

    hianimeService.setApiKey(hianimeApiKey)
    loadAnimeInfo()
    loadEpisodes()
  }, [animeId, hianimeApiKey, navigate])

  const loadAnimeInfo = async () => {
    if (!animeId) return

    try {
      setLoading(true)
      setError(null)
      const data = await hianimeService.getAnimeInfo(animeId)
      setAnimeInfo(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load anime information')
    } finally {
      setLoading(false)
    }
  }

  const loadEpisodes = async () => {
    if (!animeId) return

    try {
      setEpisodesLoading(true)
      setEpisodesError(null)
      const data = await hianimeService.getAnimeEpisodes(animeId)
      setEpisodes(data)
      
      // Set first episode as selected by default
      if (data.episodes.length > 0) {
        setSelectedEpisode(data.episodes[0])
        loadEpisodeServers(data.episodes[0].episodeId)
      }
    } catch (err) {
      setEpisodesError(err instanceof Error ? err.message : 'Failed to load episodes')
    } finally {
      setEpisodesLoading(false)
    }
  }

  const loadEpisodeServers = async (episodeId: string) => {
    try {
      setServersLoading(true)
      setServersError(null)
      const data = await hianimeService.getEpisodeServers(episodeId)
      setServers(data)
      
      // Set first available server as selected
      const availableServers = data[selectedLanguage] || data.sub || data.dub
      if (availableServers.length > 0) {
        setSelectedServer(availableServers[0])
        // Load streaming URL for the first server
        loadStreamingUrl(episodeId, availableServers[0].serverId)
      }
    } catch (err) {
      setServersError(err instanceof Error ? err.message : 'Failed to load episode servers')
    } finally {
      setServersLoading(false)
    }
  }

  const loadStreamingUrl = async (episodeId: string, serverId: number) => {
    try {
      setStreamingUrlLoading(true)
      setStreamingUrlError(null)
      const data = await hianimeService.getEpisodeStreamingUrl(episodeId, serverId, selectedLanguage)
      setStreamingUrl(data.url)
    } catch (err) {
      setStreamingUrlError(err instanceof Error ? err.message : 'Failed to load streaming URL')
    } finally {
      setStreamingUrlLoading(false)
    }
  }

  const handleEpisodeSelect = (episode: HiAnimeEpisode) => {
    setSelectedEpisode(episode)
    loadEpisodeServers(episode.episodeId)
    
    // Save to continue watching
    if (animeInfo?.anime?.info) {
      const animeMedia = hianimeService.convertInfoToMedia(animeInfo.anime.info)
      dispatch(addToHiAnimeContinueWatching(animeMedia))
      
      // Save episode progress
      dispatch(saveHiAnimeEpisodeProgress({
        animeId: animeInfo.anime.info.id,
        episodeId: episode.episodeId,
        episodeNumber: episode.number,
        episodeTitle: episode.title,
        language: selectedLanguage
      }))
    }
  }

  const handleLanguageChange = (language: 'sub' | 'dub') => {
    setSelectedLanguage(language)
    // Clear previous streaming URL
    setStreamingUrl(null)
    if (servers) {
      const availableServers = servers[language] || servers.sub || servers.dub
      if (availableServers.length > 0) {
        setSelectedServer(availableServers[0])
        // Load streaming URL for the new server
        if (selectedEpisode) {
          loadStreamingUrl(selectedEpisode.episodeId, availableServers[0].serverId)
        }
      }
    }
  }

  const handleServerSelect = (server: HiAnimeServer) => {
    setSelectedServer(server)
    // Clear previous streaming URL and load new one
    setStreamingUrl(null)
    if (selectedEpisode) {
      loadStreamingUrl(selectedEpisode.episodeId, server.serverId)
    }
  }

  if (loading) {
    return (
      <div className="p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
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
          {error}
        </p>
        <button
          onClick={() => navigate('/hianime')}
          className="btn-primary"
        >
          Back to HiAnime
        </button>
      </div>
    )
  }

  if (!animeInfo) {
    return (
      <div className="p-8 text-center">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Anime not found
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          The requested anime could not be found
        </p>
        <button
          onClick={() => navigate('/hianime')}
          className="btn-primary mt-4"
        >
          Back to HiAnime
        </button>
      </div>
    )
  }

  const { info, moreInfo } = animeInfo.anime || {}
  const { mostPopularAnimes } = animeInfo || {}
  const popularAnimes = (mostPopularAnimes || []).map(anime => ({
    id: anime.id,
    title: anime.name,
    image: anime.poster,
    url: `/hianime/${anime.id}`,
    type: 'hianime' as const,
    jname: anime.jname,
    episodes: anime.episodes,
    totalEpisodes: anime.episodes.sub || anime.episodes.dub || 0,
    subOrDub: anime.episodes.sub ? 'sub' : 'dub',
    animeType: anime.type
  }))

  return (
    <div className="p-6">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/hianime')}
          className="mb-6 flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to HiAnime
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Video Player Area */}
            <div className="aspect-video bg-gray-900 dark:bg-gray-800 rounded-lg overflow-hidden">
              {streamingUrlLoading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
                    <p className="text-gray-300">Loading player...</p>
                  </div>
                </div>
              ) : streamingUrlError ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      Failed to load player
                    </h3>
                    <p className="text-gray-300 mb-4">
                      {streamingUrlError}
                    </p>
                    <button
                      onClick={() => selectedEpisode && selectedServer && loadStreamingUrl(selectedEpisode.episodeId, selectedServer.serverId)}
                      className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : streamingUrl ? (
                streamingUrl.includes('hianime.to') ? (
                  <iframe
                    src={streamingUrl}
                    className="w-full h-full"
                    title={`${selectedEpisode?.title || 'Episode'} - ${selectedServer?.serverName || 'Server'}`}
                    allow="autoplay; fullscreen; picture-in-picture"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-800">
                    <div className="text-center p-8">
                      <div className="w-16 h-16 mx-auto mb-4 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z"/>
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-white mb-2">
                        Episode Ready to Stream
                      </h3>
                      <p className="text-gray-300 mb-4">
                        {selectedEpisode?.title}
                      </p>
                      <p className="text-sm text-gray-400 mb-4">
                        Server: {selectedServer?.serverName} | Language: {selectedLanguage.toUpperCase()}
                      </p>
                      <div className="bg-gray-700 rounded-lg p-4 mb-4">
                        <p className="text-sm text-gray-300">
                          <strong>Streaming URL:</strong> {streamingUrl}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          This URL was fetched from the HiAnime API. Click below to open in a new tab.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          window.open(streamingUrl, '_blank')
                        }}
                        className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                      >
                        Open in New Tab
                      </button>
                    </div>
                  </div>
                )
              ) : selectedEpisode && selectedServer ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {selectedEpisode.title}
                    </h3>
                    <p className="text-gray-300">
                      Server: {selectedServer.serverName} | Language: {selectedLanguage.toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-400 mt-2">
                      Loading streaming URL...
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gray-600 rounded-full flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-gray-300">Select an episode to start watching</p>
                  </div>
                </div>
              )}
            </div>

            {/* External Link for Selected Episode */}
            {selectedEpisode && (
              <div className="flex justify-center">
                <a
                  href={`https://hianime.to/watch/${animeId}?ep=${selectedEpisode.episodeId.split('?ep=').pop() || selectedEpisode.episodeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title={`Open Episode ${selectedEpisode.number} on HiAnime.to`}
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            )}

            {/* Episode Selection */}
            {episodes && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    Episodes ({episodes.totalEpisodes})
                  </h2>
                  
                  {/* Language Toggle */}
                  <div className="flex bg-gray-200 dark:bg-gray-700 rounded-lg p-1">
                    <button
                      onClick={() => handleLanguageChange('sub')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedLanguage === 'sub'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Sub
                    </button>
                    <button
                      onClick={() => handleLanguageChange('dub')}
                      className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                        selectedLanguage === 'dub'
                          ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-white shadow-sm'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }`}
                    >
                      Dub
                    </button>
                  </div>
                </div>

                {episodesLoading ? (
                  <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">Loading episodes...</p>
                  </div>
                ) : episodesError ? (
                  <div className="text-center py-8">
                    <p className="text-red-600 dark:text-red-400 mb-4">{episodesError}</p>
                    <button
                      onClick={loadEpisodes}
                      className="btn-primary"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-96 overflow-y-auto">
                    {episodes.episodes.map((episode) => (
                      <button
                        key={episode.episodeId}
                        onClick={() => handleEpisodeSelect(episode)}
                        className={`p-3 rounded-lg text-left transition-colors ${
                          selectedEpisode?.episodeId === episode.episodeId
                            ? 'bg-red-600 text-white'
                            : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium">
                            Episode {episode.number}
                          </span>
                          {episode.isFiller && (
                            <span className="text-xs bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 px-2 py-1 rounded">
                              Filler
                            </span>
                          )}
                        </div>
                        <p className="text-xs opacity-90 truncate">
                          {episode.title}
                        </p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Server Selection */}
            {servers && selectedEpisode && (
              <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Streaming Servers
                </h3>
                
                {serversLoading ? (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-400 mt-2 text-sm">Loading servers...</p>
                  </div>
                ) : serversError ? (
                  <div className="text-center py-4">
                    <p className="text-red-600 dark:text-red-400 text-sm mb-2">{serversError}</p>
                    <button
                      onClick={() => selectedEpisode && loadEpisodeServers(selectedEpisode.episodeId)}
                      className="btn-primary text-sm"
                    >
                      Try Again
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Sub Servers */}
                    {servers.sub.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Subbed Servers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {servers.sub.map((server) => (
                            <button
                              key={`sub-${server.serverId}`}
                              onClick={() => handleServerSelect(server)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedServer?.serverId === server.serverId && selectedLanguage === 'sub'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              {server.serverName} (ID: {server.serverId})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Dub Servers */}
                    {servers.dub.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Dubbed Servers
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {servers.dub.map((server) => (
                            <button
                              key={`dub-${server.serverId}`}
                              onClick={() => handleServerSelect(server)}
                              className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                                selectedServer?.serverId === server.serverId && selectedLanguage === 'dub'
                                  ? 'bg-red-600 text-white'
                                  : 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white hover:bg-gray-100 dark:hover:bg-gray-600'
                              }`}
                            >
                              {server.serverName} (ID: {server.serverId})
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Anime Info */}
            <div className="space-y-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                {info.name}
              </h1>
              
              <div className="flex flex-wrap gap-2">
                {moreInfo.genres.map((genre: string, index: number) => (
                  <span
                    key={index}
                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="prose dark:prose-invert max-w-none">
                <p className="text-gray-700 dark:text-gray-300">
                  {info.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Type:</span>
                  <p className="text-gray-900 dark:text-white">{info.stats.type}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Episodes:</span>
                  <p className="text-gray-900 dark:text-white">
                    Sub: {info.stats.episodes.sub || 'N/A'} | Dub: {info.stats.episodes.dub || 'N/A'}
                  </p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Duration:</span>
                  <p className="text-gray-900 dark:text-white">{info.stats.duration}</p>
                </div>
                <div>
                  <span className="text-gray-500 dark:text-gray-400">Rating:</span>
                  <p className="text-gray-900 dark:text-white">{info.stats.rating}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Anime Poster */}
            <div>
              <img
                src={info.poster}
                alt={info.name}
                className="w-full rounded-lg shadow-lg"
              />
              {/* External Link for Anime */}
              <div className="mt-3 flex justify-center">
                <a
                  href={`https://hianime.to/watch/${animeId}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center w-10 h-10 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
                  title="Open on HiAnime.to"
                >
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Most Popular Animes */}
            {popularAnimes.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Most Popular Animes
                </h3>
                <MediaGrid
                  media={popularAnimes}
                  loading={false}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default HiAnimeWatchPage