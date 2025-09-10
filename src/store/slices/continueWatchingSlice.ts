import { createSlice } from '@reduxjs/toolkit'
import type { PayloadAction } from '@reduxjs/toolkit'
import type { Video } from '../../types/youtube'

interface ContinueWatchingState {
  videos: Video[]
  lastWatchedTimes: Record<string, number> // videoId -> timestamp
  videoProgress: Record<string, number> // videoId -> progress percentage (0-100)
  videoDurations: Record<string, number> // videoId -> duration in seconds
}

const initialState: ContinueWatchingState = {
  videos: [],
  lastWatchedTimes: {},
  videoProgress: {},
  videoDurations: {},
}

// Load from localStorage on initialization
const loadFromStorage = (): ContinueWatchingState => {
  try {
    const stored = localStorage.getItem('continueWatching')
    if (stored) {
      const parsed = JSON.parse(stored)
      return {
        videos: parsed.videos || [],
        lastWatchedTimes: parsed.lastWatchedTimes || {},
        videoProgress: parsed.videoProgress || {},
        videoDurations: parsed.videoDurations || {},
      }
    }
  } catch (error) {
    console.error('Error loading continue watching from localStorage:', error)
  }
  return initialState
}

// Save to localStorage
const saveToStorage = (state: ContinueWatchingState) => {
  try {
    localStorage.setItem('continueWatching', JSON.stringify(state))
  } catch (error) {
    console.error('Error saving continue watching to localStorage:', error)
  }
}

const continueWatchingSlice = createSlice({
  name: 'continueWatching',
  initialState: loadFromStorage(),
  reducers: {
    addToContinueWatching: (state, action: PayloadAction<Video>) => {
      const video = action.payload
      const existingIndex = state.videos.findIndex(v => v.id === video.id)
      
      if (existingIndex !== -1) {
        // Move to front if already exists
        state.videos.splice(existingIndex, 1)
      }
      
      // Add to beginning
      state.videos.unshift(video)
      
      // Update last watched time
      state.lastWatchedTimes[video.id] = Date.now()
      
      saveToStorage(state)
    },
    
    removeFromContinueWatching: (state, action: PayloadAction<string>) => {
      const videoId = action.payload
      state.videos = state.videos.filter(v => v.id !== videoId)
      delete state.lastWatchedTimes[videoId]
      saveToStorage(state)
    },
    
    clearContinueWatching: (state) => {
      state.videos = []
      state.lastWatchedTimes = {}
      state.videoProgress = {}
      state.videoDurations = {}
      saveToStorage(state)
    },
    
    updateLastWatchedTime: (state, action: PayloadAction<string>) => {
      const videoId = action.payload
      if (state.videos.some(v => v.id === videoId)) {
        state.lastWatchedTimes[videoId] = Date.now()
        saveToStorage(state)
      }
    },

    updateVideoProgress: (state, action: PayloadAction<{ videoId: string; currentTime: number; duration: number }>) => {
      const { videoId, currentTime, duration } = action.payload
      
      // Only update if video is in continue watching
      if (state.videos.some(v => v.id === videoId)) {
        const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
        
        // Store progress and duration
        state.videoProgress[videoId] = progressPercentage
        state.videoDurations[videoId] = duration
        
        // Check if video should be removed (90%+ progress)
        if (progressPercentage >= 90) {
          console.log(`Video ${videoId} completed (${progressPercentage.toFixed(1)}%), removing from continue watching`)
          state.videos = state.videos.filter(v => v.id !== videoId)
          delete state.lastWatchedTimes[videoId]
          delete state.videoProgress[videoId]
          delete state.videoDurations[videoId]
        }
        
        saveToStorage(state)
      }
    },

    addToContinueWatchingWithProgress: (state, action: PayloadAction<{ video: Video; currentTime: number; duration: number }>) => {
      const { video, currentTime, duration } = action.payload
      
      // Only add if watched for more than 10 seconds
      if (currentTime >= 10) {
        const existingIndex = state.videos.findIndex(v => v.id === video.id)
        
        if (existingIndex !== -1) {
          // Move to front if already exists
          state.videos.splice(existingIndex, 1)
        }
        
        // Add to beginning
        state.videos.unshift(video)
        
        // Update progress and times
        const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0
        state.videoProgress[video.id] = progressPercentage
        state.videoDurations[video.id] = duration
        state.lastWatchedTimes[video.id] = Date.now()
        
        saveToStorage(state)
      }
    },
  },
})

export const {
  addToContinueWatching,
  removeFromContinueWatching,
  clearContinueWatching,
  updateLastWatchedTime,
  updateVideoProgress,
  addToContinueWatchingWithProgress,
} = continueWatchingSlice.actions

export const selectContinueWatching = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.videos
export const selectLastWatchedTimes = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.lastWatchedTimes
export const selectVideoProgress = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.videoProgress
export const selectVideoDurations = (state: { continueWatching: ContinueWatchingState }) => state.continueWatching.videoDurations

// Selector to get saved progress for a specific video
export const selectVideoSavedProgress = (videoId: string) => (state: { continueWatching: ContinueWatchingState }) => {
  const progress = state.continueWatching.videoProgress[videoId]
  const duration = state.continueWatching.videoDurations[videoId]
  
  if (progress && duration) {
    // Convert percentage back to seconds
    return (progress / 100) * duration
  }
  
  return 0
}

export default continueWatchingSlice.reducer
