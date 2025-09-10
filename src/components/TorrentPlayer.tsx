import { useState, useEffect, useRef, useCallback } from 'react'
import { useAppSelector } from '../store'
import { selectTorrentApiUrl } from '../store/slices/settingsSlice'
import { torrentSearchService as torrentService } from '../services/torrentSearch'
import type { TorrentPlayerState } from '../types/torrent'
import YouTubePlayer from './YouTubePlayer'
import LoadingSpinner from './LoadingSpinner'

interface TorrentPlayerProps {
  // For movies
  movieTitle?: string
  // For TV shows
  showTitle?: string
  season?: number
  episode?: number
  // Fallback YouTube video
  youtubeVideoId?: string
  // Callbacks
  onVideoEnd?: () => void
  onError?: (error: string) => void
  className?: string
}

const TorrentPlayer = ({
  movieTitle,
  showTitle,
  season,
  episode,
  youtubeVideoId,
  onVideoEnd,
  onError,
  className = ''
}: TorrentPlayerProps) => {
  const torrentApiUrl = useAppSelector(selectTorrentApiUrl)
  const [playerState, setPlayerState] = useState<TorrentPlayerState>({
    isLoading: false,
    error: null,
    status: 'idle',
    progress: 0,
    message: ''
  })
  const [useTorrent, setUseTorrent] = useState(true)
  const [magnetUrl, setMagnetUrl] = useState<string | null>(null)
  const [torrentError, setTorrentError] = useState<string | null>(null)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const torrentRef = useRef<any>(null)
  const clientRef = useRef<any>(null)

  // Initialize WebTorrent client (disabled for now due to browser compatibility issues)
  useEffect(() => {
    // For now, disable torrent functionality due to WebTorrent browser compatibility issues
    setTorrentError('Torrent playback not available in this build')
    setUseTorrent(false)
    
    return () => {
      if (clientRef.current) {
        try {
          clientRef.current.destroy()
        } catch (error) {
          console.warn('Error destroying WebTorrent client:', error)
        }
      }
    }
  }, [])

  // Update torrent service URL when settings change
  useEffect(() => {
    torrentService.setBaseUrl(torrentApiUrl)
  }, [torrentApiUrl])

  const updateState = useCallback((updates: Partial<TorrentPlayerState>) => {
    setPlayerState(prev => ({ ...prev, ...updates }))
  }, [])

  const searchForTorrent = useCallback(async () => {
    if (!useTorrent || !clientRef.current) {
      setUseTorrent(false)
      return
    }

    updateState({
      isLoading: true,
      status: 'searching',
      message: 'Searching for torrent...',
      progress: 10
    })

    try {
      let searchResult
      
      if (movieTitle) {
        searchResult = await torrentService.searchMovieTorrents(movieTitle)
      } else if (showTitle && season && episode) {
        searchResult = await torrentService.searchTVTorrents(showTitle, season, episode)
      } else {
        throw new Error('No valid search parameters provided')
      }

      updateState({
        status: 'fetching',
        message: 'Found torrents, selecting best one...',
        progress: 30
      })

      const bestMagnet = torrentService.getBestTorrent(searchResult)
      
      if (!bestMagnet) {
        throw new Error('No suitable torrent found')
      }

      setMagnetUrl(bestMagnet)
      
      updateState({
        status: 'loading',
        message: 'Loading torrent...',
        progress: 50
      })

      await loadTorrent(bestMagnet)
      
    } catch (error) {
      console.error('Torrent search failed:', error)
      setTorrentError(error instanceof Error ? error.message : 'Failed to search for torrent')
      setUseTorrent(false)
      updateState({
        isLoading: false,
        status: 'failed',
        error: error instanceof Error ? error.message : 'Failed to search for torrent',
        message: 'Falling back to YouTube...'
      })
    }
  }, [movieTitle, showTitle, season, episode, useTorrent, updateState])

  const loadTorrent = useCallback(async (magnet: string) => {
    if (!clientRef.current) {
      throw new Error('WebTorrent client not available')
    }

    return new Promise<void>((resolve, reject) => {
      const torrent = clientRef.current.add(magnet, (torrent: any) => {
        torrentRef.current = torrent
        
        updateState({
          message: 'Torrent loaded, finding video file...',
          progress: 70
        })

        // Find the largest video file
        const videoFile = torrent.files.find((file: any) => 
          file.name.match(/\.(mp4|avi|mkv|mov|wmv|flv|webm)$/i)
        )

        if (!videoFile) {
          reject(new Error('No video file found in torrent'))
          return
        }

        updateState({
          message: 'Creating video stream...',
          progress: 90
        })

        // Create video element and stream
        const video = videoRef.current
        if (video) {
          video.src = URL.createObjectURL(videoFile.createReadStream())
          video.load()
          
          video.addEventListener('loadeddata', () => {
            updateState({
              isLoading: false,
              status: 'playing',
              message: 'Playing torrent...',
              progress: 100
            })
            resolve()
          })

          video.addEventListener('error', () => {
            reject(new Error('Failed to load video from torrent'))
          })
        } else {
          reject(new Error('Video element not available'))
        }
      })

      torrent.on('error', (error: Error) => {
        reject(error)
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        if (torrentRef.current !== torrent) {
          reject(new Error('Torrent loading timeout'))
        }
      }, 30000)
    })
  }, [updateState])

  // Start torrent search when component mounts or parameters change
  useEffect(() => {
    if (useTorrent && (movieTitle || (showTitle && season && episode))) {
      searchForTorrent()
    }
  }, [movieTitle, showTitle, season, episode, useTorrent, searchForTorrent])

  // Handle video end
  const handleVideoEnd = useCallback(() => {
    onVideoEnd?.()
  }, [onVideoEnd])

  // Handle errors
  const handleError = useCallback((error: string) => {
    onError?.(error)
  }, [onError])

  // If torrent failed or we're not using torrent, show YouTube fallback
  if (!useTorrent || torrentError || playerState.status === 'failed') {
    if (youtubeVideoId) {
      return (
        <div className={className}>
          <YouTubePlayer
            videoId={youtubeVideoId}
          />
          {torrentError && (
            <div className="mt-2 p-2 bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 text-sm rounded">
              Torrent unavailable: {torrentError}. Playing YouTube trailer instead.
            </div>
          )}
        </div>
      )
    } else {
      return (
        <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              No video available
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
  }

  // If WebTorrent is not available, show a message and fallback to YouTube
  if (!clientRef.current && useTorrent) {
    if (youtubeVideoId) {
      return (
        <div className={className}>
          <YouTubePlayer
            videoId={youtubeVideoId}
          />
          <div className="mt-2 p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 text-sm rounded">
            Torrent player not available in this environment. Playing YouTube trailer instead.
          </div>
        </div>
      )
    } else {
      return (
        <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
          <div className="text-center">
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
              Torrent player not available
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
  }

  // Show loading state while searching/loading torrent
  if (playerState.isLoading || playerState.status === 'searching' || playerState.status === 'fetching' || playerState.status === 'loading') {
    return (
      <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-gray-600 dark:text-gray-400 text-lg mt-4">
            {playerState.message}
          </p>
          {playerState.progress > 0 && (
            <div className="w-full max-w-xs mx-auto mt-4">
              <div className="bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${playerState.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    )
  }

  // Show torrent video player
  if (playerState.status === 'playing' && magnetUrl) {
    return (
      <div className={className}>
        <video
          ref={videoRef}
          controls
          className="w-full h-full rounded-lg"
          onEnded={handleVideoEnd}
          onError={() => handleError('Video playback error')}
        />
        <div className="mt-2 p-2 bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-200 text-sm rounded">
          Playing from torrent: {movieTitle || `${showTitle} S${season}E${episode}`}
        </div>
      </div>
    )
  }

  // Default fallback
  return (
    <div className={`${className} bg-gray-200 dark:bg-gray-800 rounded-lg aspect-video flex items-center justify-center`}>
      <div className="text-center">
        <p className="text-gray-500 dark:text-gray-400 text-lg mb-4">
          Loading...
        </p>
        <LoadingSpinner />
      </div>
    </div>
  )
}

export default TorrentPlayer
