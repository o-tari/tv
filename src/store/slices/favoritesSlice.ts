import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import { 
  TvIcon, 
  FilmIcon, 
  SparklesIcon, 
  MagnifyingGlassIcon, 
  HandThumbUpIcon, 
  ClipboardDocumentListIcon, 
  UserIcon, 
  ClockIcon, 
  ClockIcon as WatchLaterIcon, 
  Cog6ToothIcon 
} from '@heroicons/react/24/outline'

interface SidebarItem {
  id: string
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface FavoritesState {
  favoriteItems: string[] // Array of item IDs that are favorited
  sidebarItems: SidebarItem[]
}

const defaultSidebarItems: SidebarItem[] = [
  { id: 'youtube', label: 'YouTube', href: '/youtube', icon: TvIcon },
  { id: 'movies-tv', label: 'Movies & TV', href: '/movies-tv', icon: FilmIcon },
  { id: 'anime', label: 'Anime', href: '/anime', icon: SparklesIcon },
  { id: 'hianime', label: 'HiAnime', href: '/hianime', icon: SparklesIcon },
  { id: 'torrents', label: 'Torrent Search', href: '/torrents', icon: MagnifyingGlassIcon },
  { id: 'liked', label: 'Liked videos', href: '/library/liked', icon: HandThumbUpIcon },
  { id: 'playlists', label: 'Playlists', href: '/library/playlists', icon: ClipboardDocumentListIcon },
  { id: 'channel', label: 'Your channel', href: '/channel/me', icon: UserIcon },
  { id: 'history', label: 'History', href: '/history', icon: ClockIcon },
  { id: 'watch-later', label: 'Watch later', href: '/watch-later', icon: WatchLaterIcon },
  { id: 'settings', label: 'Settings', href: '/settings', icon: Cog6ToothIcon },
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
