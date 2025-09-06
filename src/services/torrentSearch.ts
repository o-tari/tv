import { 
  type Torrent, 
  type TorrentSearchResult, 
  type TorrentProvider, 
  type TorrentSearchParams,
  type TorrentDetails,
  type TorrentSearchApiProvider,
  type TorrentSearchApiResponse
} from '../types/torrent'
import { store } from '../store'
import { selectUseMockData } from '../store/slices/settingsSlice'

// Import torrent-search-api
const TorrentSearchApi = require('torrent-search-api')

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

// Initialize torrent search API
let isApiInitialized = false

const initializeApi = () => {
  if (isApiInitialized) return
  
  try {
    // Enable public providers by default
    TorrentSearchApi.enablePublicProviders()
    isApiInitialized = true
    console.log('Torrent Search API initialized with public providers')
  } catch (error) {
    console.error('Failed to initialize Torrent Search API:', error)
  }
}

// Convert API provider format to our format
const convertApiProvider = (apiProvider: TorrentSearchApiProvider): TorrentProvider => {
  return {
    name: apiProvider.name,
    public: apiProvider.public,
    categories: apiProvider.categories
  }
}

// Convert API response to our Torrent format
const convertApiResponse = (apiResponse: TorrentSearchApiResponse): Torrent => {
  return {
    id: `${apiResponse.provider}-${Date.now()}-${Math.random()}`,
    title: apiResponse.title,
    provider: apiResponse.provider,
    time: apiResponse.time || apiResponse.date || 'Unknown',
    size: apiResponse.size,
    seeds: apiResponse.seeds || 0,
    peers: apiResponse.peers || 0,
    magnet: apiResponse.magnet,
    desc: apiResponse.desc,
    category: apiResponse.category,
    subcategory: apiResponse.subcategory,
    url: apiResponse.url || apiResponse.link,
    infoHash: apiResponse.infoHash,
    date: apiResponse.date,
    link: apiResponse.link,
    quality: apiResponse.quality,
    language: apiResponse.language,
    uploader: apiResponse.uploader,
    verified: apiResponse.verified
  }
}

// Check if we should use mock data for torrent services
const shouldUseMockData = () => {
  const state = store.getState()
  return selectUseMockData(state)
}

// Search torrents using torrent-search-api
export const searchTorrents = async (params: TorrentSearchParams): Promise<TorrentSearchResult> => {
  try {
    const { query, category = 'All', limit = 20, providers } = params
    
    // If mock data is enabled, use mock data
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
    
    // Use real torrent-search-api
    console.log('Using real torrent search API')
    initializeApi()
    
    let searchResults: TorrentSearchApiResponse[] = []
    
    if (providers && providers.length > 0) {
      // Search with specific providers
      searchResults = await TorrentSearchApi.search(providers, query, category === 'All' ? undefined : category, limit)
    } else {
      // Search with all active providers
      searchResults = await TorrentSearchApi.search(query, category === 'All' ? undefined : category, limit)
    }
    
    // Convert API responses to our format
    const torrents = searchResults.map(convertApiResponse)
    
    return {
      torrents,
      totalResults: torrents.length,
      currentPage: 1,
      hasNextPage: torrents.length === limit
    }
    
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
  try {
    initializeApi()
    const apiProviders = TorrentSearchApi.getProviders()
    return apiProviders.map(convertApiProvider)
  } catch (error) {
    console.error('Error getting providers:', error)
    return []
  }
}

// Get active providers
export const getActiveProviders = (): TorrentProvider[] => {
  try {
    initializeApi()
    const activeApiProviders = TorrentSearchApi.getActiveProviders()
    return activeApiProviders.map(convertApiProvider)
  } catch (error) {
    console.error('Error getting active providers:', error)
    return []
  }
}

// Enable a specific provider
export const enableProvider = (providerName: string, credentials?: string | string[]): boolean => {
  try {
    initializeApi()
    
    if (credentials) {
      if (Array.isArray(credentials)) {
        // Cookie authentication
        TorrentSearchApi.enableProvider(providerName, credentials)
      } else {
        // Username/password authentication
        TorrentSearchApi.enableProvider(providerName, credentials, credentials)
      }
    } else {
      // Public provider
      TorrentSearchApi.enableProvider(providerName)
    }
    
    console.log(`Enabled provider: ${providerName}`, credentials ? 'with credentials' : 'without credentials')
    return true
  } catch (error) {
    console.error(`Error enabling provider ${providerName}:`, error)
    return false
  }
}

// Disable a specific provider
export const disableProvider = (providerName: string): boolean => {
  try {
    initializeApi()
    TorrentSearchApi.disableProvider(providerName)
    console.log(`Disabled provider: ${providerName}`)
    return true
  } catch (error) {
    console.error(`Error disabling provider ${providerName}:`, error)
    return false
  }
}

// Enable all public providers
export const enableAllPublicProviders = (): boolean => {
  try {
    initializeApi()
    TorrentSearchApi.enablePublicProviders()
    console.log('Enabled all public providers')
    return true
  } catch (error) {
    console.error('Error enabling all public providers:', error)
    return false
  }
}

// Disable all providers
export const disableAllProviders = (): boolean => {
  try {
    initializeApi()
    TorrentSearchApi.disableAllProviders()
    console.log('Disabled all providers')
    return true
  } catch (error) {
    console.error('Error disabling all providers:', error)
    return false
  }
}

// Check if a provider is active
export const isProviderActive = (providerName: string): boolean => {
  try {
    initializeApi()
    return TorrentSearchApi.isProviderActive(providerName)
  } catch (error) {
    console.error(`Error checking if provider ${providerName} is active:`, error)
    return false
  }
}

// Get torrent details using torrent-search-api
export const getTorrentDetails = async (torrent: Torrent): Promise<TorrentDetails | null> => {
  try {
    if (shouldUseMockData()) {
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
    }
    
    initializeApi()
    
    // Convert our torrent back to API format for details request
    const apiTorrent = {
      title: torrent.title,
      provider: torrent.provider,
      time: torrent.time,
      size: torrent.size,
      seeds: torrent.seeds,
      peers: torrent.peers,
      magnet: torrent.magnet,
      desc: torrent.desc,
      category: torrent.category,
      subcategory: torrent.subcategory,
      url: torrent.url,
      infoHash: torrent.infoHash,
      date: torrent.date,
      link: torrent.link,
      quality: torrent.quality,
      language: torrent.language,
      uploader: torrent.uploader,
      verified: torrent.verified
    }
    
    const details = await TorrentSearchApi.getTorrentDetails(apiTorrent)
    
    return {
      title: torrent.title,
      description: details || `Details for ${torrent.title}`,
      files: [],
      comments: []
    }
  } catch (error) {
    console.error('Error getting torrent details:', error)
    return null
  }
}

// Get magnet URL using torrent-search-api
export const getMagnetUrl = async (torrent: Torrent): Promise<string | null> => {
  try {
    if (shouldUseMockData()) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 300))
      
      return torrent.magnet || `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.title)}`
    }
    
    initializeApi()
    
    // Convert our torrent back to API format for magnet request
    const apiTorrent = {
      title: torrent.title,
      provider: torrent.provider,
      time: torrent.time,
      size: torrent.size,
      seeds: torrent.seeds,
      peers: torrent.peers,
      magnet: torrent.magnet,
      desc: torrent.desc,
      category: torrent.category,
      subcategory: torrent.subcategory,
      url: torrent.url,
      infoHash: torrent.infoHash,
      date: torrent.date,
      link: torrent.link,
      quality: torrent.quality,
      language: torrent.language,
      uploader: torrent.uploader,
      verified: torrent.verified
    }
    
    const magnet = await TorrentSearchApi.getMagnet(apiTorrent)
    return magnet || torrent.magnet || `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.title)}`
  } catch (error) {
    console.error('Error getting magnet URL:', error)
    return torrent.magnet || `magnet:?xt=urn:btih:${torrent.infoHash}&dn=${encodeURIComponent(torrent.title)}`
  }
}

// Download torrent file using torrent-search-api
export const downloadTorrent = async (torrent: Torrent, filename?: string): Promise<Buffer | null> => {
  try {
    if (shouldUseMockData()) {
      console.log(`Downloading torrent: ${torrent.title}`, filename ? `as ${filename}` : 'as buffer')
      return null
    }
    
    initializeApi()
    
    // Convert our torrent back to API format for download request
    const apiTorrent = {
      title: torrent.title,
      provider: torrent.provider,
      time: torrent.time,
      size: torrent.size,
      seeds: torrent.seeds,
      peers: torrent.peers,
      magnet: torrent.magnet,
      desc: torrent.desc,
      category: torrent.category,
      subcategory: torrent.subcategory,
      url: torrent.url,
      infoHash: torrent.infoHash,
      date: torrent.date,
      link: torrent.link,
      quality: torrent.quality,
      language: torrent.language,
      uploader: torrent.uploader,
      verified: torrent.verified
    }
    
    if (filename) {
      await TorrentSearchApi.downloadTorrent(apiTorrent, filename)
      return null
    } else {
      return await TorrentSearchApi.downloadTorrent(apiTorrent)
    }
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
