import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { type Channel } from '../../types/youtube'

interface SubscriptionsState {
  subscriptions: Channel[]
  isLoading: boolean
  error: string | null
}

const loadFromStorage = (key: string, defaultValue: any) => {
  try {
    const item = localStorage.getItem(key)
    return item ? JSON.parse(item) : defaultValue
  } catch (error) {
    return defaultValue
  }
}

const saveToStorage = (key: string, value: any) => {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    // Failed to save to localStorage
  }
}

const initialState: SubscriptionsState = {
  subscriptions: loadFromStorage('subscriptions', []),
  isLoading: false,
  error: null,
}

const subscriptionsSlice = createSlice({
  name: 'subscriptions',
  initialState,
  reducers: {
    addSubscription: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload
      const existingIndex = state.subscriptions.findIndex(sub => sub.id === channel.id)
      
      if (existingIndex === -1) {
        state.subscriptions.push(channel)
        saveToStorage('subscriptions', state.subscriptions)
      }
    },
    removeSubscription: (state, action: PayloadAction<string>) => {
      const channelId = action.payload
      state.subscriptions = state.subscriptions.filter(sub => sub.id !== channelId)
      saveToStorage('subscriptions', state.subscriptions)
    },
    toggleSubscription: (state, action: PayloadAction<Channel>) => {
      const channel = action.payload
      const existingIndex = state.subscriptions.findIndex(sub => sub.id === channel.id)
      
      if (existingIndex === -1) {
        state.subscriptions.push(channel)
      } else {
        state.subscriptions.splice(existingIndex, 1)
      }
      saveToStorage('subscriptions', state.subscriptions)
    },
    clearSubscriptions: (state) => {
      state.subscriptions = []
      saveToStorage('subscriptions', [])
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  addSubscription,
  removeSubscription,
  toggleSubscription,
  clearSubscriptions,
  setLoading,
  setError,
} = subscriptionsSlice.actions

export default subscriptionsSlice.reducer

// Selectors
export const selectSubscriptions = (state: { subscriptions: SubscriptionsState }) => state.subscriptions.subscriptions
export const selectIsSubscribed = (channelId: string) => (state: { subscriptions: SubscriptionsState }) => 
  state.subscriptions.subscriptions.some(sub => sub.id === channelId)
export const selectSubscriptionsLoading = (state: { subscriptions: SubscriptionsState }) => state.subscriptions.isLoading
export const selectSubscriptionsError = (state: { subscriptions: SubscriptionsState }) => state.subscriptions.error
