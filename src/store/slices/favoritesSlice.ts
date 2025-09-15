import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: string
}

interface FavoritesState {
  favoriteItems: string[] // Array of item IDs that are favorited
  sidebarItems: SidebarItem[]
}

const defaultSidebarItems: SidebarItem[] = [
  { id: 'youtube', label: 'YouTube', href: '/youtube', icon: '📺' },
  { id: 'movies-tv', label: 'Movies & TV', href: '/movies-tv', icon: '🎬' },
  { id: 'anime', label: 'Anime', href: '/anime', icon: '🎌' },
  { id: 'hianime', label: 'HiAnime', href: '/hianime', icon: '🌸' },
  { id: 'torrents', label: 'Torrent Search', href: '/torrents', icon: '🔍' },
  { id: 'liked', label: 'Liked videos', href: '/library/liked', icon: '👍' },
  { id: 'playlists', label: 'Playlists', href: '/library/playlists', icon: '📋' },
  { id: 'channel', label: 'Your channel', href: '/channel/me', icon: '👤' },
  { id: 'history', label: 'History', href: '/history', icon: '🕒' },
  { id: 'watch-later', label: 'Watch later', href: '/watch-later', icon: '⏰' },
  { id: 'settings', label: 'Settings', href: '/settings', icon: '⚙️' },
]

const initialState: FavoritesState = {
  favoriteItems: JSON.parse(localStorage.getItem('favoriteItems') || '[]'),
  sidebarItems: defaultSidebarItems,
}

const favoritesSlice = createSlice({
  name: 'favorites',
  initialState,
  reducers: {
    toggleFavorite: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      const isFavorite = state.favoriteItems.includes(itemId)
      
      if (isFavorite) {
        state.favoriteItems = state.favoriteItems.filter(id => id !== itemId)
      } else {
        state.favoriteItems.push(itemId)
      }
      
      localStorage.setItem('favoriteItems', JSON.stringify(state.favoriteItems))
    },
    addFavorite: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      if (!state.favoriteItems.includes(itemId)) {
        state.favoriteItems.push(itemId)
        localStorage.setItem('favoriteItems', JSON.stringify(state.favoriteItems))
      }
    },
    removeFavorite: (state, action: PayloadAction<string>) => {
      const itemId = action.payload
      state.favoriteItems = state.favoriteItems.filter(id => id !== itemId)
      localStorage.setItem('favoriteItems', JSON.stringify(state.favoriteItems))
    },
    clearFavorites: (state) => {
      state.favoriteItems = []
      localStorage.setItem('favoriteItems', JSON.stringify(state.favoriteItems))
    },
  },
})

export const {
  toggleFavorite,
  addFavorite,
  removeFavorite,
  clearFavorites,
} = favoritesSlice.actions

export const selectFavoriteItems = (state: { favorites: FavoritesState }) => state.favorites.favoriteItems
export const selectSidebarItems = (state: { favorites: FavoritesState }) => state.favorites.sidebarItems
export const selectIsFavorite = (itemId: string) => (state: { favorites: FavoritesState }) => 
  state.favorites.favoriteItems.includes(itemId)

export default favoritesSlice.reducer
