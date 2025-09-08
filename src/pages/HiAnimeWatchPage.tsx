import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAppSelector } from '../store'
import { selectHianimeApiKey } from '../store/slices/settingsSlice'
import { hianimeService } from '../services/hianime'
import type { HiAnimeInfoResponse } from '../types/hianime'
import MediaGrid from '../components/MediaGrid'

const HiAnimeWatchPage = () => {
  const { animeId } = useParams<{ animeId: string }>()
  const navigate = useNavigate()
  const hianimeApiKey = useAppSelector(selectHianimeApiKey)
  const [animeInfo, setAnimeInfo] = useState<HiAnimeInfoResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const { info, moreInfo } = animeInfo.anime
  const { mostPopularAnimes } = animeInfo
  const popularAnimes = mostPopularAnimes.map(anime => ({
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

        {/* Anime Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Poster */}
          <div className="lg:col-span-1">
            <img
              src={info.poster}
              alt={info.name}
              className="w-full rounded-lg shadow-lg"
            />
          </div>

          {/* Details */}
          <div className="lg:col-span-2">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {info.name}
            </h1>
            
            {moreInfo.japanese && (
              <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
                {moreInfo.japanese}
              </p>
            )}

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Type:</span>
                <p className="text-gray-900 dark:text-white">{info.stats.type}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</span>
                <p className="text-gray-900 dark:text-white">{moreInfo.status}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Episodes:</span>
                <p className="text-gray-900 dark:text-white">
                  Sub: {info.stats.episodes.sub || 'N/A'} | Dub: {info.stats.episodes.dub || 'N/A'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Duration:</span>
                <p className="text-gray-900 dark:text-white">{info.stats.duration}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Rating:</span>
                <p className="text-gray-900 dark:text-white">{info.stats.rating}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Quality:</span>
                <p className="text-gray-900 dark:text-white">{info.stats.quality}</p>
              </div>
              {moreInfo.malscore && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">MAL Score:</span>
                  <p className="text-gray-900 dark:text-white">{moreInfo.malscore}</p>
                </div>
              )}
              <div>
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Aired:</span>
                <p className="text-gray-900 dark:text-white">{moreInfo.aired}</p>
              </div>
            </div>

            {/* Genres */}
            {moreInfo.genres.length > 0 && (
              <div className="mb-6">
                <span className="text-sm font-medium text-gray-500 dark:text-gray-400 block mb-2">Genres:</span>
                <div className="flex flex-wrap gap-2">
                  {moreInfo.genres.map((genre: string, index: number) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-full text-sm"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Studios & Producers */}
            <div className="mb-6">
              {moreInfo.studios && (
                <div className="mb-2">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Studio:</span>
                  <p className="text-gray-900 dark:text-white">{moreInfo.studios}</p>
                </div>
              )}
              {moreInfo.producers.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">Producers:</span>
                  <p className="text-gray-900 dark:text-white">{moreInfo.producers.join(', ')}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Description</h2>
          <p className="text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-line">
            {info.description}
          </p>
        </div>

        {/* Characters & Voice Actors */}
        {info.charactersVoiceActors.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Characters & Voice Actors</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {info.charactersVoiceActors.map((item: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <div className="flex items-center space-x-3 mb-2">
                    <img
                      src={item.character.poster}
                      alt={item.character.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.character.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.character.cast}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.voiceActor.poster}
                      alt={item.voiceActor.name}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{item.voiceActor.name}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.voiceActor.cast}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Promotional Videos */}
        {info.promotionalVideos.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Promotional Videos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {info.promotionalVideos.map((video: any, index: number) => (
                <div key={index} className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                  <h3 className="font-medium text-gray-900 dark:text-white mb-2">{video.title}</h3>
                  <div className="aspect-video">
                    <iframe
                      src={video.source}
                      title={video.title}
                      className="w-full h-full rounded"
                      allowFullScreen
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Most Popular Animes */}
        {popularAnimes.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Most Popular Animes</h2>
            <MediaGrid
              media={popularAnimes}
              loading={false}
            />
          </div>
        )}
      </div>
    </div>
  )
}

export default HiAnimeWatchPage
