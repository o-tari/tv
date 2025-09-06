import { 
  type Torrent, 
  type TorrentSearchResult, 
  type TorrentProvider, 
  type TorrentSearchParams,
  type TorrentDetails 
} from '../types/torrent'
import { store } from '../store'
import { selectUseMockData } from '../store/slices/settingsSlice'

// Mock data for demonstration - in a real app, you'd use actual torrent APIs
const mockTorrents: Torrent[] = [
  {
    id: 'mock-1',
    title: 'Sample Movie 2024 1080p BluRay x264',
    provider: '1337x',
    time: '2 hours ago',
    size: '2.1 GB',
    seeds: 1250,
    peers: 89,
    magnet: 'magnet:?xt=urn:btih:1234567890abcdef&dn=Sample+Movie+2024',
    desc: 'High quality movie torrent',
    category: 'Movies',
    url: 'https://1337x.to/torrent/1234567890/',
    infoHash: '1234567890abcdef'
  },
  {
    id: 'mock-2',
    title: 'Popular TV Series S01E01 720p HDTV',
    provider: 'ThePirateBay',
    time: '1 day ago',
    size: '800 MB',
    seeds: 567,
    peers: 45,
    magnet: 'magnet:?xt=urn:btih:abcdef1234567890&dn=Popular+TV+Series',
    desc: 'Latest episode of popular series',
    category: 'TV',
    url: 'https://thepiratebay.org/description.php?id=1234567890',
    infoHash: 'abcdef1234567890'
  },
  {
    id: 'mock-3',
    title: 'Music Album 2024 FLAC',
    provider: 'Rarbg',
    time: '3 days ago',
    size: '450 MB',
    seeds: 234,
    peers: 23,
    magnet: 'magnet:?xt=urn:btih:9876543210fedcba&dn=Music+Album+2024',
    desc: 'Lossless music album',
    category: 'Music',
    url: 'https://rarbg.to/torrent/9876543210',
    infoHash: '9876543210fedcba'
  }
]

// Available providers
const availableProviders: TorrentProvider[] = [
  { name: '1337x', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'ThePirateBay', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'Rarbg', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'Torrentz2', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'KickassTorrents', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'TorrentProject', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'Yts', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'Limetorrents', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] },
  { name: 'Eztv', public: true, categories: ['All', 'Movies', 'TV', 'Music', 'Games', 'Software', 'Books', 'Anime'] }
]

// Check if we should use mock data for torrent services
const shouldUseMockData = () => {
  const state = store.getState()
  return selectUseMockData(state)
}

// Search torrents using mock data (in a real app, you'd call actual APIs)
export const searchTorrents = async (params: TorrentSearchParams): Promise<TorrentSearchResult> => {
  try {
    const { query, category = 'All', limit = 20, providers } = params
    
    // If mock data is enabled, always use mock data
    if (shouldUseMockData()) {
      console.log('Mock data enabled, using mock data for torrent search')
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Filter mock data based on search criteria
      let filteredTorrents = mockTorrents.filter(torrent => {
        const matchesQuery = torrent.title.toLowerCase().includes(query.toLowerCase())
        const matchesCategory = category === 'All' || torrent.category === category
        const matchesProvider = !providers || providers.length === 0 || providers.includes(torrent.provider)
        
        return matchesQuery && matchesCategory && matchesProvider
      })
      
      // Limit results
      filteredTorrents = filteredTorrents.slice(0, limit)
      
      return {
        torrents: filteredTorrents,
        totalResults: filteredTorrents.length,
        currentPage: 1,
        hasNextPage: filteredTorrents.length === limit
      }
    }
    
    // If mock data is disabled, throw error (no real torrent API implemented)
    throw new Error('Real torrent search is not implemented. Please enable mock data mode to use torrent search.')
    
  } catch (error) {
    console.error('Error searching torrents:', error)
    return {
      torrents: [],
      totalResults: 0,
      currentPage: 1,
      hasNextPage: false
    }
  }
}

// Get available providers
export const getProviders = (): TorrentProvider[] => {
  return availableProviders
}

// Get active providers
export const getActiveProviders = (): TorrentProvider[] => {
  return availableProviders
}

// Enable a specific provider (mock implementation)
export const enableProvider = (providerName: string, credentials?: string | string[]): boolean => {
  console.log(`Enabling provider: ${providerName}`, credentials ? 'with credentials' : 'without credentials')
  return true
}

// Disable a specific provider (mock implementation)
export const disableProvider = (providerName: string): boolean => {
  console.log(`Disabling provider: ${providerName}`)
  return true
}

// Get torrent details (mock implementation)
export const getTorrentDetails = async (torrent: Torrent): Promise<TorrentDetails | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500))
    
    return {
      title: torrent.title,
      description: `Detailed description for ${torrent.title}. This is a mock implementation.`,
      files: [
        { name: `${torrent.title}.mkv`, size: torrent.size },
        { name: 'sample.mkv', size: '50 MB' }
      ],
      comments: [
        { author: 'User1', text: 'Great quality!', date: '2 hours ago' },
        { author: 'User2', text: 'Thanks for sharing!', date: '1 day ago' }
      ]
    }
  } catch (error) {
    console.error('Error getting torrent details:', error)
    return null
  }
}

// Get magnet URL (mock implementation)
export const getMagnetUrl = async (torrent: Torrent): Promise<string | null> => {
  try {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300))
    
    return torrent.magnet || `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.title)}`
  } catch (error) {
    console.error('Error getting magnet URL:', error)
    return null
  }
}

// Download torrent file (mock implementation)
export const downloadTorrent = async (torrent: Torrent, filename?: string): Promise<Buffer | null> => {
  try {
    console.log(`Downloading torrent: ${torrent.title}`, filename ? `as ${filename}` : 'as buffer')
    // In a real implementation, you would download the actual torrent file
    return null
  } catch (error) {
    console.error('Error downloading torrent:', error)
    return null
  }
}

// Get popular categories
export const getPopularCategories = (): string[] => {
  return [
    'All',
    'Movies',
    'TV',
    'Music',
    'Games',
    'Software',
    'Books',
    'Anime',
    'Documentaries',
    'Other'
  ]
}
