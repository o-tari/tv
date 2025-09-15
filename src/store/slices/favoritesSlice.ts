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
  iconName: string
}

// Icon mapping for serializable storage
export const iconMap = {
  'TvIcon': TvIcon,
  'FilmIcon': FilmIcon,
  'SparklesIcon': SparklesIcon,
  'MagnifyingGlassIcon': MagnifyingGlassIcon,
  'HandThumbUpIcon': HandThumbUpIcon,
  'ClipboardDocumentListIcon': ClipboardDocumentListIcon,
  'UserIcon': UserIcon,
  'ClockIcon': ClockIcon,
  'WatchLaterIcon': WatchLaterIcon,
  'Cog6ToothIcon': Cog6ToothIcon,
} as const

export type IconName = keyof typeof iconMap

// Helper function to get icon component from name
export const getIconComponent = (iconName: string): React.ComponentType<{ className?: string }> => {
  return iconMap[iconName as IconName] || iconMap.TvIcon
}

interface FavoritesState {
  favoriteItems: string[] // Array of item IDs that are favorited
  sidebarItems: SidebarItem[]
}

const defaultSidebarItems: SidebarItem[] = [
  { id: 'youtube', label: 'YouTube', href: '/youtube', iconName: 'TvIcon' },
  { id: 'movies-tv', label: 'Movies & TV', href: '/movies-tv', iconName: 'FilmIcon' },
  { id: 'anime', label: 'Anime', href: '/anime', iconName: 'SparklesIcon' },
  { id: 'hianime', label: 'HiAnime', href: '/hianime', iconName: 'SparklesIcon' },
  { id: 'torrents', label: 'Torrent Search', href: '/torrents', iconName: 'MagnifyingGlassIcon' },
  { id: 'liked', label: 'Liked videos', href: '/library/liked', iconName: 'HandThumbUpIcon' },
  { id: 'playlists', label: 'Playlists', href: '/library/playlists', iconName: 'ClipboardDocumentListIcon' },
  { id: 'channel', label: 'Your channel', href: '/channel/me', iconName: 'UserIcon' },
  { id: 'history', label: 'History', href: '/history', iconName: 'ClockIcon' },
  { id: 'watch-later', label: 'Watch later', href: '/watch-later', iconName: 'WatchLaterIcon' },
  { id: 'settings', label: 'Settings', href: '/settings', iconName: 'Cog6ToothIcon' },
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
