import { useEffect, useRef, useState } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { updatePlayerState } from '../store/slices/uiSlice'

interface EnhancedYouTubePlayerProps {
  videoId: string
  onReady?: () => void
  onStateChange?: (state: number) => void
  onVideoEnd?: () => void
  showControls?: boolean
}

declare global {
  interface Window {
    YT: any
    onYouTubeIframeAPIReady: () => void
  }
}

// YouTube Player State Constants
const YT_PLAYER_STATE = {
  UNSTARTED: -1,
  ENDED: 0,
  PLAYING: 1,
  PAUSED: 2,
  BUFFERING: 3,
  CUED: 5
}

// Event logging utility
const logYouTubeEvent = (eventName: string, data?: any) => {
  // Safe JSON stringify that handles circular references
  const safeStringify = (obj: any): string => {
    try {
      return JSON.stringify(obj, (key, value) => {
        // Skip circular references and DOM elements
        if (typeof value === 'object' && value !== null) {
          if (value.constructor && value.constructor.name === 'HTMLDivElement') {
            return '[HTMLDivElement]'
          }
          if (value.constructor && value.constructor.name === 'FiberNode') {
            return '[FiberNode]'
          }
          // Check for circular references
          if (key && typeof value === 'object') {
            const seen = new WeakSet()
            if (seen.has(value)) {
              return '[Circular]'
            }
            seen.add(value)
          }
        }
        return value
      })
    } catch (error) {
      return '[Object - Circular Reference]'
    }
  }

  console.log(`🎬 YouTube Event: ${eventName}`, data ? data : '')
  
  // Also log to a dedicated event log (optional)
  const eventLog = document.getElementById('youtube-event-log')
  if (eventLog) {
    const timestamp = new Date().toLocaleTimeString()
    const logEntry = document.createElement('div')
    logEntry.className = 'text-xs text-gray-500 border-b border-gray-200 py-1'
    logEntry.innerHTML = `<span class="font-mono">[${timestamp}]</span> ${eventName}${data ? ` - ${safeStringify(data)}` : ''}`
    eventLog.appendChild(logEntry)
    
    // Keep only last 50 events
    while (eventLog.children.length > 50) {
      eventLog.removeChild(eventLog.firstChild!)
    }
    
    // Auto-scroll to bottom
    eventLog.scrollTop = eventLog.scrollHeight
  }
}

const EnhancedYouTubePlayer = ({ videoId, onReady, onStateChange, onVideoEnd, showControls = true }: EnhancedYouTubePlayerProps) => {
  const playerRef = useRef<HTMLDivElement>(null)
  const playerInstanceRef = useRef<any>(null)
  const dispatch = useAppDispatch()
  const { } = useAppSelector((state) => state.ui)
  const [isAPIReady, setIsAPIReady] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(50)
  const [isMuted, setIsMuted] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [currentQuality, setCurrentQuality] = useState('')
  const [availableQualities, setAvailableQualities] = useState<string[]>([])
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isBuffering, setIsBuffering] = useState(false)
  const [showLogsModal, setShowLogsModal] = useState(false)
  const [isPictureInPicture, setIsPictureInPicture] = useState(false)
  const [isPictureInPictureSupported, setIsPictureInPictureSupported] = useState(false)

  // Load YouTube IFrame API
  useEffect(() => {
    if (window.YT) {
      setIsAPIReady(true)
      return
    }

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    document.head.appendChild(script)

    window.onYouTubeIframeAPIReady = () => {
      logYouTubeEvent('API_READY')
      setIsAPIReady(true)
    }

    return () => {
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Check Picture-in-Picture support
  useEffect(() => {
    const checkPictureInPictureSupport = () => {
      // Check if the browser supports Picture-in-Picture API
      const isSupported = 'pictureInPictureEnabled' in document
      console.log('Picture-in-Picture support check:', isSupported)
      setIsPictureInPictureSupported(isSupported)
    }

    checkPictureInPictureSupport()
  }, [isAPIReady])

  // Listen for Picture-in-Picture events
  useEffect(() => {
    const handlePictureInPictureChange = () => {
      setIsPictureInPicture(!!document.pictureInPictureElement)
    }

    if (isPictureInPictureSupported) {
      document.addEventListener('enterpictureinpicture', handlePictureInPictureChange)
      document.addEventListener('leavepictureinpicture', handlePictureInPictureChange)
    }

    return () => {
      document.removeEventListener('enterpictureinpicture', handlePictureInPictureChange)
      document.removeEventListener('leavepictureinpicture', handlePictureInPictureChange)
    }
  }, [isPictureInPictureSupported])

  // Initialize player with comprehensive event logging
  useEffect(() => {
    if (!isAPIReady || !playerRef.current || !videoId) return

    const initializePlayer = () => {
      if (playerInstanceRef.current) {
        playerInstanceRef.current.destroy()
      }

      logYouTubeEvent('PLAYER_INITIALIZING', { videoId })

      playerInstanceRef.current = new window.YT.Player(playerRef.current, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
          autoplay: 0,
          controls: 1,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          fs: 1,
          cc_load_policy: 0,
          playsinline: 1,
        },
        events: {
          onReady: (event: any) => {
            logYouTubeEvent('PLAYER_READY', event)
            
            // Get initial player state
            const player = event.target
            const initialDuration = player.getDuration()
            const initialVolume = player.getVolume()
            const initialPlaybackRate = player.getPlaybackRate()
            
            setDuration(initialDuration)
            setVolume(initialVolume)
            setPlaybackRate(initialPlaybackRate)
            
            // Get available qualities
            const qualities = player.getAvailableQualityLevels()
            setAvailableQualities(qualities)
            setCurrentQuality(player.getPlaybackQuality())
            
            logYouTubeEvent('PLAYER_INITIAL_STATE', {
              duration: initialDuration,
              volume: initialVolume,
              playbackRate: initialPlaybackRate,
              qualities: qualities,
              currentQuality: player.getPlaybackQuality()
            })
            
            onReady?.()
          },
          
          onStateChange: (event: any) => {
            const state = event.data
            const stateName = Object.keys(YT_PLAYER_STATE).find(key => YT_PLAYER_STATE[key as keyof typeof YT_PLAYER_STATE] === state) || 'UNKNOWN'
            
            logYouTubeEvent('STATE_CHANGE', { 
              state, 
              stateName,
              currentTime: playerInstanceRef.current?.getCurrentTime() || 0,
              duration: playerInstanceRef.current?.getDuration() || 0
            })
            
            setIsPlaying(state === YT_PLAYER_STATE.PLAYING)
            setIsBuffering(state === YT_PLAYER_STATE.BUFFERING)
            
            // Check if video has ended
            if (state === YT_PLAYER_STATE.ENDED) {
              logYouTubeEvent('VIDEO_ENDED')
              console.log('🎬 EnhancedYouTubePlayer: Video ended, calling onVideoEnd')
              onVideoEnd?.()
            }
            
            onStateChange?.(state)
            
            // Update Redux state
            dispatch(updatePlayerState({
              isPlaying: state === YT_PLAYER_STATE.PLAYING,
              duration: playerInstanceRef.current?.getDuration() || 0,
            }))
          },
          
          onPlaybackQualityChange: (event: any) => {
            const quality = event.data
            logYouTubeEvent('QUALITY_CHANGE', { quality })
            setCurrentQuality(quality)
          },
          
          onPlaybackRateChange: (event: any) => {
            const rate = event.data
            logYouTubeEvent('PLAYBACK_RATE_CHANGE', { rate })
            setPlaybackRate(rate)
          },
          
          onError: (event: any) => {
            const error = event.data
            const errorMessages = {
              2: 'Invalid video ID',
              5: 'HTML5 player error',
              100: 'Video not found or private',
              101: 'Video not allowed in embedded players',
              150: 'Video not allowed in embedded players'
            }
            
            logYouTubeEvent('ERROR', { 
              error, 
              message: errorMessages[error as keyof typeof errorMessages] || 'Unknown error'
            })
          },
          
          onApiChange: (event: any) => {
            logYouTubeEvent('API_CHANGE', event)
          },
          
          onVolumeChange: () => {
            const currentVolume = playerInstanceRef.current?.getVolume() || 0
            const isMuted = playerInstanceRef.current?.isMuted() || false
            logYouTubeEvent('VOLUME_CHANGE', { volume: currentVolume, isMuted })
            setVolume(currentVolume)
            setIsMuted(isMuted)
          }
        },
      })
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initializePlayer, 100)
    return () => clearTimeout(timer)
  }, [isAPIReady, videoId, dispatch, onReady, onStateChange, onVideoEnd])

  // Update current time periodically
  useEffect(() => {
    if (!isPlaying || !playerInstanceRef.current) return

    const interval = setInterval(() => {
      const time = playerInstanceRef.current?.getCurrentTime() || 0
      setCurrentTime(time)
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying])

  // Player control functions
  const play = () => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_PLAY')
      playerInstanceRef.current.playVideo()
    }
  }

  const pause = () => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_PAUSE')
      playerInstanceRef.current.pauseVideo()
    }
  }

  const togglePlayPause = () => {
    if (isPlaying) {
      pause()
    } else {
      play()
    }
  }

  const seekTo = (seconds: number) => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_SEEK', { seconds })
      playerInstanceRef.current.seekTo(seconds, true)
    }
  }

  const handleSetVolume = (newVolume: number) => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_VOLUME', { volume: newVolume })
      playerInstanceRef.current.setVolume(newVolume)
      setVolume(newVolume)
    }
  }

  const toggleMute = () => {
    if (playerInstanceRef.current) {
      if (isMuted) {
        logYouTubeEvent('CONTROL_UNMUTE')
        playerInstanceRef.current.unMute()
      } else {
        logYouTubeEvent('CONTROL_MUTE')
        playerInstanceRef.current.mute()
      }
      setIsMuted(!isMuted)
    }
  }

  const handleSetPlaybackRate = (rate: number) => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_PLAYBACK_RATE', { rate })
      playerInstanceRef.current.setPlaybackRate(rate)
      setPlaybackRate(rate)
    }
  }

  const handleSetQuality = (quality: string) => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_QUALITY', { quality })
      playerInstanceRef.current.setPlaybackQuality(quality)
      setCurrentQuality(quality)
    }
  }

  const toggleFullscreen = () => {
    if (playerInstanceRef.current) {
      logYouTubeEvent('CONTROL_FULLSCREEN', { isFullscreen: !isFullscreen })
      const playerElement = playerInstanceRef.current.getIframe()
      if (playerElement.requestFullscreen) {
        playerElement.requestFullscreen()
      } else if ((playerElement as any).webkitRequestFullscreen) {
        (playerElement as any).webkitRequestFullscreen()
      } else if ((playerElement as any).msRequestFullscreen) {
        (playerElement as any).msRequestFullscreen()
      }
      setIsFullscreen(!isFullscreen)
    }
  }

  const togglePictureInPicture = async () => {
    try {
      if (!isPictureInPictureSupported) {
        console.warn('Picture-in-Picture is not supported in this browser')
        alert('Picture-in-Picture is not supported in this browser.')
        return
      }

      // YouTube iframes don't support Picture-in-Picture directly
      // Show a helpful message to the user
      alert('Picture-in-Picture is not available for YouTube videos due to browser security restrictions. You can use the browser\'s native Picture-in-Picture feature by right-clicking on the video and selecting "Picture in Picture" from the context menu.')
      
      logYouTubeEvent('CONTROL_PIP', { action: 'info_shown' })
    } catch (error) {
      console.error('Picture-in-Picture error:', error)
      logYouTubeEvent('CONTROL_PIP_ERROR', { error: error instanceof Error ? error.message : String(error) })
    }
  }

  const skipBackward = () => {
    const newTime = Math.max(0, currentTime - 10)
    seekTo(newTime)
  }

  const skipForward = () => {
    const newTime = Math.min(duration, currentTime + 10)
    seekTo(newTime)
  }

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return
      }

      switch (event.key.toLowerCase()) {
        case 'k':
        case ' ':
          event.preventDefault()
          togglePlayPause()
          break
        case 'j':
          event.preventDefault()
          skipBackward()
          break
        case 'l':
          event.preventDefault()
          skipForward()
          break
        case 'f':
          event.preventDefault()
          toggleFullscreen()
          break
        case 'm':
          event.preventDefault()
          toggleMute()
          break
        case 'arrowleft':
          event.preventDefault()
          skipBackward()
          break
        case 'arrowright':
          event.preventDefault()
          skipForward()
          break
        case 'arrowup':
          event.preventDefault()
          handleSetVolume(Math.min(100, volume + 10))
          break
        case 'arrowdown':
          event.preventDefault()
          handleSetVolume(Math.max(0, volume - 10))
          break
        case 'escape':
          setShowLogsModal(prev => {
            if (prev) {
              event.preventDefault()
              return false
            }
            return prev
          })
          break
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isPlaying, currentTime, duration, volume, isMuted])


  return (
    <div className="space-y-4">
      {/* Main Player */}
      <div className="relative w-full aspect-video bg-black rounded-lg overflow-hidden">
        <div ref={playerRef} className="w-full h-full" />
        
        {!isAPIReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-900">
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
              <p>Loading player...</p>
            </div>
          </div>
        )}
      </div>

      {/* Control Panel */}
      {showControls && isAPIReady && (
        <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-4 space-y-4">
          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <span>{formatTime(currentTime)}</span>
              <div className="flex-1 bg-gray-300 dark:bg-gray-600 rounded-full h-2 relative">
                <div 
                  className="bg-red-600 h-2 rounded-full transition-all duration-200"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
                <input
                  type="range"
                  min="0"
                  max={duration || 0}
                  value={currentTime}
                  onChange={(e) => seekTo(parseFloat(e.target.value))}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
              </div>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Main Controls */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {/* Play/Pause */}
              <button
                onClick={togglePlayPause}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                )}
              </button>

              {/* Skip Backward */}
              <button
                onClick={skipBackward}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Skip backward 10s"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8.445 14.832A1 1 0 0010 14v-2.798l5.445 3.63A1 1 0 0017 14V6a1 1 0 00-1.555-.832L10 8.798V6a1 1 0 00-1.555-.832l-6 4a1 1 0 000 1.664l6 4z" />
                </svg>
              </button>

              {/* Skip Forward */}
              <button
                onClick={skipForward}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Skip forward 10s"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z" />
                </svg>
              </button>

              {/* Volume Control */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={toggleMute}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.293 13H3a1 1 0 01-1-1V8a1 1 0 011-1h2.293l3.09-3.793a1 1 0 011.617.793zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.617.793L5.293 13H3a1 1 0 01-1-1V8a1 1 0 011-1h2.293l3.09-3.793a1 1 0 011.617.793zM14.657 2.929a1 1 0 011.414 0A9.972 9.972 0 0119 10a9.972 9.972 0 01-2.929 7.071 1 1 0 01-1.414-1.414A7.971 7.971 0 0017 10c0-2.21-.894-4.208-2.343-5.657a1 1 0 010-1.414zm-2.829 2.828a1 1 0 011.415 0A5.983 5.983 0 0115 10a5.984 5.984 0 01-1.757 4.243 1 1 0 01-1.415-1.415A3.984 3.984 0 0013 10a3.983 3.983 0 00-1.172-2.828 1 1 0 010-1.415z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => handleSetVolume(parseInt(e.target.value))}
                  className="w-20"
                  title={`Volume: ${volume}%`}
                />
                <span className="text-sm text-gray-600 dark:text-gray-400 w-8">{volume}%</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {/* Playback Rate */}
              <div className="flex items-center space-x-1">
                <label className="text-sm text-gray-600 dark:text-gray-400">Speed:</label>
                <select
                  value={playbackRate}
                  onChange={(e) => handleSetPlaybackRate(parseFloat(e.target.value))}
                  className="text-sm bg-gray-200 dark:bg-gray-700 rounded px-2 py-1"
                >
                  <option value={0.25}>0.25x</option>
                  <option value={0.5}>0.5x</option>
                  <option value={0.75}>0.75x</option>
                  <option value={1}>1x</option>
                  <option value={1.25}>1.25x</option>
                  <option value={1.5}>1.5x</option>
                  <option value={1.75}>1.75x</option>
                  <option value={2}>2x</option>
                </select>
              </div>

              {/* Quality */}
              {availableQualities.length > 0 && (
                <div className="flex items-center space-x-1">
                  <label className="text-sm text-gray-600 dark:text-gray-400">Quality:</label>
                  <select
                    value={currentQuality}
                    onChange={(e) => handleSetQuality(e.target.value)}
                    className="text-sm bg-gray-200 dark:bg-gray-700 rounded px-2 py-1"
                  >
                    {availableQualities.map((quality) => (
                      <option key={quality} value={quality}>
                        {quality}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Event Logs */}
              <button
                onClick={() => setShowLogsModal(true)}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="View event logs"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 000 2h1.5a1 1 0 000-2H3zm0 4a1 1 0 000 2h1.5a1 1 0 000-2H3zm0 4a1 1 0 000 2h1.5a1 1 0 000-2H3zm4-8a1 1 0 000 2h1.5a1 1 0 000-2H7zm0 4a1 1 0 000 2h1.5a1 1 0 000-2H7zm0 4a1 1 0 000 2h1.5a1 1 0 000-2H7zm4-8a1 1 0 000 2h1.5a1 1 0 000-2h-1.5zm0 4a1 1 0 000 2h1.5a1 1 0 000-2h-1.5zm0 4a1 1 0 000 2h1.5a1 1 0 000-2h-1.5z" clipRule="evenodd" />
                </svg>
              </button>

              {/* Picture-in-Picture */}
              {isPictureInPictureSupported && (
                <button
                  onClick={togglePictureInPicture}
                  className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                  title={isPictureInPicture ? 'Exit Picture-in-Picture' : 'Enter Picture-in-Picture'}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 4a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2zm6-6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1H9a1 1 0 01-1-1v-2zm6-6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1V4zm0 6a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 01-1 1h-2a1 1 0 01-1-1v-2z" clipRule="evenodd" />
                  </svg>
                </button>
              )}

              {/* Fullscreen */}
              <button
                onClick={toggleFullscreen}
                className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                title="Toggle fullscreen"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h4a1 1 0 010 2H6.414l2.293 2.293a1 1 0 11-1.414 1.414L5 6.414V8a1 1 0 01-2 0V4zm9 1a1 1 0 010-2h4a1 1 0 011 1v4a1 1 0 01-2 0V6.414l-2.293 2.293a1 1 0 11-1.414-1.414L13.586 5H12zm-9 7a1 1 0 012 0v1.586l2.293-2.293a1 1 0 111.414 1.414L6.414 15H8a1 1 0 010 2H4a1 1 0 01-1-1v-4zm13-1a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 010-2h1.586l-2.293-2.293a1 1 0 111.414-1.414L15 13.586V12a1 1 0 011-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* Status Info */}
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-4">
              <span>Status: {isBuffering ? 'Buffering...' : isPlaying ? 'Playing' : 'Paused'}</span>
              <span>Quality: {currentQuality}</span>
              <span>Speed: {playbackRate}x</span>
            </div>
            <div className="text-right">
              <div>Keyboard shortcuts: K/Space (play/pause), J/L (skip), M (mute), F (fullscreen), Esc (close logs)</div>
            </div>
          </div>
        </div>
      )}

      {/* Event Logs Modal */}
      {showLogsModal && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          onClick={() => setShowLogsModal(false)}
        >
          <div 
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[80vh] flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                YouTube Events Log
              </h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const logContainer = document.getElementById('youtube-event-log')
                    if (logContainer) {
                      logContainer.innerHTML = '<div class="text-gray-500">Events will appear here...</div>'
                    }
                  }}
                  className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                >
                  Clear
                </button>
                <button
                  onClick={() => setShowLogsModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="flex-1 overflow-hidden">
              <div 
                id="youtube-event-log" 
                className="h-full overflow-y-auto text-xs font-mono bg-gray-50 dark:bg-gray-900 p-4"
              >
                <div className="text-gray-500">Events will appear here...</div>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="text-xs text-gray-500 dark:text-gray-400">
                <p>This log shows all YouTube IFrame Player API events in real-time.</p>
                <p>Use the Clear button to reset the log, or close this modal to continue watching.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default EnhancedYouTubePlayer
