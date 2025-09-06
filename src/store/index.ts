import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import historySlice from './slices/historySlice'
import videosSlice from './slices/videosSlice'
import subscriptionsSlice from './slices/subscriptionsSlice'
import continueWatchingSlice from './slices/continueWatchingSlice'
import settingsSlice from './slices/settingsSlice'
import animeSlice from './slices/animeSlice'
import animeContinueWatchingSlice from './slices/animeContinueWatchingSlice'
import tmdbContinueWatchingSlice from './slices/tmdbContinueWatchingSlice'
import tmdbWatchLaterSlice from './slices/tmdbWatchLaterSlice'
import streamingLinksSlice from './slices/streamingLinksSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    history: historySlice,
    videos: videosSlice,
    subscriptions: subscriptionsSlice,
    continueWatching: continueWatchingSlice,
    settings: settingsSlice,
    anime: animeSlice,
    animeContinueWatching: animeContinueWatchingSlice,
    tmdbContinueWatching: tmdbContinueWatchingSlice,
    tmdbWatchLater: tmdbWatchLaterSlice,
    streamingLinks: streamingLinksSlice,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST'],
      },
    }),
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch

export const useAppDispatch = () => useDispatch<AppDispatch>()
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector
