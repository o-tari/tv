import { configureStore } from '@reduxjs/toolkit'
import { useDispatch, useSelector, type TypedUseSelectorHook } from 'react-redux'
import authSlice from './slices/authSlice'
import uiSlice from './slices/uiSlice'
import historySlice from './slices/historySlice'
import videosSlice from './slices/videosSlice'
import subscriptionsSlice from './slices/subscriptionsSlice'

export const store = configureStore({
  reducer: {
    auth: authSlice,
    ui: uiSlice,
    history: historySlice,
    videos: videosSlice,
    subscriptions: subscriptionsSlice,
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
