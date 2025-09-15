# TV App

A comprehensive multi-platform entertainment application built with React, TypeScript, and modern web technologies. This app aggregates content from multiple sources including YouTube, TMDB (The Movie Database), HiAnime, and torrent search engines to provide a unified viewing experience.

## Features

### 🎬 **Multi-Platform Content**
- **YouTube Integration**: Full YouTube experience with trending videos, search, channels, and comments
- **Movies & TV Shows**: Browse and watch movies/TV shows via TMDB API with trailers and detailed information
- **Anime Content**: Access anime through HiAnime API with sub/dub options and episode management
- **Torrent Search**: Search across 16+ torrent sites for movies, TV shows, and other content

### 🏠 **Core Features**
- **Unified Home Feed**: Personalized content from all platforms with continue watching and recommendations
- **Advanced Search**: Multi-platform search with filters, categories, and intelligent suggestions
- **Watch Pages**: Dedicated viewing experiences for each content type with related recommendations
- **Channel Management**: Save and manage favorite YouTube channels and content creators
- **Content Discovery**: Explore categories, trending content, and personalized recommendations

### 📱 **User Experience**
- **Responsive Design**: Mobile-first design that works seamlessly across all devices
- **Dark/Light Themes**: Automatic theme switching with user preference persistence
- **Keyboard Shortcuts**: Full keyboard navigation ("/" search, "k" play/pause, "j/l" seek, "f" fullscreen)
- **Accessibility**: WCAG compliant with ARIA roles, screen reader support, and keyboard navigation
- **Offline Support**: Cached content and settings for offline viewing capabilities

### 🔧 **Advanced Features**
- **Continue Watching**: Resume playback across all platforms with progress tracking
- **Watch Later Lists**: Save content for later viewing with cross-platform support
- **History Tracking**: Complete viewing history with search and filter capabilities
- **Settings Management**: Centralized configuration for all API keys and preferences
- **Caching System**: Intelligent caching with 1-hour expiration for optimal performance

## Tech Stack

- **Frontend**: React 19 + TypeScript + Vite
- **Routing**: React Router v7
- **State Management**: Redux Toolkit
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Testing**: Jest + React Testing Library
- **Linting**: ESLint + Prettier

## Prerequisites

- Node.js 18+ 
- npm or yarn
- API Keys (optional - app works with mock data by default):
  - YouTube Data API v3 key
  - TMDB API key
  - HiAnime API key (RapidAPI)
  - Torrent search API endpoint (optional)

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd youtube
```

### 2. Install dependencies

```bash
npm install
```

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

### 4. Configure API Settings

The app uses a centralized settings modal for all API configurations. No environment variables are needed:

1. Click the settings icon in the header
2. Configure your API keys:
   - **YouTube API Key**: Get from [Google Cloud Console](https://console.cloud.google.com/)
   - **TMDB API Key**: Get from [TMDB API](https://www.themoviedb.org/settings/api)
   - **HiAnime API Key**: Get from [RapidAPI HiAnime](https://rapidapi.com/hianime/api/hianime)
   - **Torrent API Endpoint**: Optional custom torrent search API
3. Configure region code (e.g., US, GB, JP) and language (e.g., en, es, fr)
4. Toggle mock data mode for testing without API keys
5. Save your settings

All settings are stored in your browser's local storage and persist between sessions.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage

## Project Structure

```
src/
├── app/                    # App configuration and providers
│   ├── App.tsx            # Main app component with routing
│   ├── Layout.tsx         # Layout wrapper with sidebar and header
│   └── providers/         # Context providers (Theme, etc.)
├── components/            # Reusable UI components
│   ├── Header.tsx         # Navigation header with search and settings
│   ├── Sidebar.tsx        # Navigation sidebar with platform tabs
│   ├── VideoCard.tsx      # Universal video card component
│   ├── VideoGrid.tsx      # Responsive video grid layout
│   ├── YouTubePlayer.tsx  # YouTube IFrame player
│   ├── TMDBMediaCard.tsx  # TMDB movie/TV show card
│   ├── TorrentsTable.tsx  # Torrent search results table
│   ├── SearchBar.tsx      # Multi-platform search component
│   ├── Settings.tsx       # Settings modal for API configuration
│   └── ...                # Additional UI components
├── features/              # Feature-specific components and logic
│   ├── home/              # Home page components
│   ├── search/            # Search functionality
│   ├── watch/             # Watch page components
│   ├── channel/           # Channel management
│   ├── explore/           # Content discovery
│   └── history/           # Viewing history
├── hooks/                 # Custom React hooks
│   ├── useVideo.ts        # Video-related hooks
│   └── useChannel.ts      # Channel-related hooks
├── pages/                 # Page components for all platforms
│   ├── HomePage.tsx       # Unified home page
│   ├── YouTubePage.tsx    # YouTube-specific home
│   ├── MoviesTVPage.tsx   # Movies & TV shows page
│   ├── HiAnimePage.tsx    # Anime content page
│   ├── TorrentSearchPage.tsx # Torrent search page
│   ├── SearchPage.tsx     # Universal search page
│   ├── WatchPage.tsx      # YouTube watch page
│   ├── TMDBWatchPage.tsx  # Movie/TV watch page
│   ├── HiAnimeWatchPage.tsx # Anime watch page
│   ├── ChannelPage.tsx    # YouTube channel page
│   ├── HistoryPage.tsx    # Viewing history
│   ├── WatchLaterPage.tsx # Watch later list
│   ├── ContinueWatchingPage.tsx # Continue watching
│   ├── SettingsPage.tsx   # Settings configuration
│   └── ...                # Additional pages
├── services/              # API service integrations
│   ├── youtube.ts         # YouTube Data API v3 client
│   ├── tmdb.ts           # TMDB API client
│   ├── hianime.ts        # HiAnime API client
│   ├── torrentSearch.ts  # Torrent search service
│   ├── jikan.ts          # Jikan (MyAnimeList) API client
│   └── newEpisodeService.ts # Episode tracking service
├── store/                 # Redux store and state management
│   ├── index.ts           # Store configuration
│   └── slices/            # Redux slices for different features
│       ├── settingsSlice.ts # API keys and app settings
│       ├── videosSlice.ts   # YouTube videos state
│       ├── tmdbSlice.ts     # TMDB content state
│       ├── hianimeSlice.ts  # Anime content state
│       ├── torrentSlice.ts  # Torrent search state
│       ├── historySlice.ts  # Viewing history
│       └── continueWatchingSlice.ts # Continue watching
├── types/                 # TypeScript type definitions
│   ├── youtube.ts         # YouTube API types
│   ├── tmdb.ts           # TMDB API types
│   ├── hianime.ts        # HiAnime API types
│   ├── torrent.ts        # Torrent search types
│   └── index.ts          # Shared types
└── utils/                 # Utility functions and helpers
    ├── formatTime.ts      # Time formatting utilities
    ├── formatNumber.ts    # Number formatting utilities
    ├── apiConfig.ts       # API configuration helpers
    ├── requestCache.ts    # Request caching utilities
    ├── rateLimiter.ts     # API rate limiting
    └── ...                # Additional utilities
```

## API Integrations

The app integrates with multiple APIs to provide comprehensive content access:

### 🎥 **YouTube Data API v3**
**Base URL**: `https://www.googleapis.com/youtube/v3`

**Key Endpoints**:
- `search.list` - Search for videos, channels, playlists with advanced filtering
- `videos.list` - Get video details, statistics, and trending content
- `channels.list` - Retrieve channel information and statistics
- `commentThreads.list` - Access video comments and discussions
- `playlistItems.list` - Browse channel playlists and uploads
- `videoCategories.list` - Get available video categories

**Features**: Full YouTube experience with search, trending videos, channel management, and related video recommendations.

### 🎬 **TMDB (The Movie Database) API**
**Base URL**: `https://api.themoviedb.org/3`

**Key Endpoints**:
- `/search/movie` - Search for movies with filters
- `/search/tv` - Search for TV shows with filters
- `/trending/movie/{time_window}` - Get trending movies (day/week)
- `/trending/tv/{time_window}` - Get trending TV shows (day/week)
- `/movie/{movie_id}` - Detailed movie information with trailers
- `/tv/{tv_id}` - Detailed TV show information with episodes
- `/discover/movie` - Discover movies with advanced filtering
- `/discover/tv` - Discover TV shows with advanced filtering

**Features**: Comprehensive movie/TV database with trailers, ratings, cast information, and personalized recommendations.

### 🎌 **HiAnime API (RapidAPI)**
**Base URL**: `https://hianime.p.rapidapi.com`

**Key Endpoints**:
- `/anime/home` - Home page data with trending, latest episodes, and top rankings
- `/anime/info` - Detailed anime information with episodes and metadata
- `/anime/search` - Search anime with filters (type, status, rating, genre)
- `/anime/episodes/{animeId}` - Get anime episodes and seasons
- `/anime/servers` - Get available streaming servers
- `/anime/episode-srcs` - Get episode streaming sources

**Features**: Complete anime streaming platform with sub/dub options, episode management, and comprehensive anime database.

### 🔍 **Torrent Search Integration**
**Supported Sites**: 16+ torrent sites including PirateBay, 1337x, TorrentGalaxy, Nyaa.si, and more

**Features**:
- Multi-site torrent search across 16+ platforms
- Real-time search with filtering by category, size, and date
- Magnet link generation and direct download support
- Provider status monitoring and fallback systems
- Mock data support for development and testing

### 📊 **Jikan API (MyAnimeList)**
**Base URL**: `https://api.jikan.moe/v4`

**Key Endpoints**:
- `/anime` - Get anime information from MyAnimeList
- `/manga` - Get manga information
- `/top/anime` - Top rated anime lists
- `/seasons` - Seasonal anime information

**Features**: Additional anime metadata and ratings integration with MyAnimeList database.

## Performance & Caching Features

### 🚀 **Performance Optimizations**
- **Code Splitting**: Lazy loading per route with React.lazy()
- **Infinite Scroll**: Efficient pagination across all platforms
- **Skeleton Loading**: Better perceived performance with loading states
- **React.memo**: Prevent unnecessary re-renders of components
- **Image Lazy Loading**: Optimize image loading with intersection observer
- **Bundle Optimization**: Tree shaking and dynamic imports

### 💾 **Caching System**
- **Local Storage Caching**: 1-hour cache duration for all API responses
- **Request Deduplication**: Prevents duplicate API calls
- **Intelligent Cache Invalidation**: Automatic cache refresh based on content type
- **Offline Support**: Cached content available without internet connection
- **Cache Management**: Manual cache clearing and monitoring tools

### ⚡ **API Rate Limiting**
- **YouTube API**: Built-in rate limiting to respect API quotas
- **TMDB API**: Efficient request batching and caching
- **HiAnime API**: 1-hour cache with automatic refresh
- **Torrent Search**: Provider status monitoring and fallback systems
- **Error Handling**: Graceful degradation with mock data fallbacks

### 🔄 **State Management**
- **Redux Toolkit**: Centralized state management with RTK Query
- **Optimistic Updates**: Immediate UI updates with background sync
- **Persistent State**: User preferences and settings saved across sessions
- **Memory Management**: Automatic cleanup of unused data and components

## Accessibility Features

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Skip Links**: Quick navigation
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant colors

## Configuration Guide

### 🔑 **API Key Setup**

#### YouTube Data API v3
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable YouTube Data API v3
4. Create credentials (API Key)
5. Restrict the key to YouTube Data API v3 for security
6. Copy the API key to the app settings

#### TMDB API
1. Visit [TMDB API Settings](https://www.themoviedb.org/settings/api)
2. Create a free account
3. Request an API key (v3 auth)
4. Copy the API key to the app settings

#### HiAnime API (RapidAPI)
1. Go to [RapidAPI HiAnime](https://rapidapi.com/hianime/api/hianime)
2. Subscribe to the API (free tier available)
3. Copy your RapidAPI key
4. Paste it in the app settings

#### Torrent Search API (Optional)
- Configure a custom torrent search API endpoint
- Or use the built-in mock data for testing
- Supports multiple torrent sites automatically

### ⚙️ **Settings Configuration**

The app provides a centralized settings interface accessible via the settings icon in the header:

- **API Keys**: Configure all required API keys
- **Region/Language**: Set content region and language preferences
- **Mock Data Mode**: Toggle for testing without API keys
- **Theme**: Switch between light and dark themes
- **Cache Management**: Clear cached data and view cache statistics
- **Provider Settings**: Configure torrent search providers

### 🔧 **Environment Variables (Optional)**

While the app works entirely through the settings interface, you can also set environment variables:

```bash
# Optional environment variables
VITE_YOUTUBE_API_KEY=your_youtube_api_key
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_HIANIME_API_KEY=your_hianime_api_key
VITE_TORRENT_API_URL=your_torrent_api_url
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Key Features Overview

### 🎯 **Multi-Platform Content Aggregation**
This TV app serves as a unified hub for entertainment content from multiple sources:

- **YouTube**: Full video platform experience with search, trending, channels, and comments
- **Movies & TV**: Comprehensive database with trailers, ratings, cast info, and recommendations
- **Anime**: Complete anime streaming with sub/dub options, episode management, and seasonal content
- **Torrents**: Search across 16+ torrent sites for movies, TV shows, and other content

### 🔧 **Technical Highlights**
- **Modern Stack**: React 19, TypeScript, Vite, Tailwind CSS
- **State Management**: Redux Toolkit with persistent storage
- **API Integration**: 5+ different APIs with intelligent caching
- **Performance**: Code splitting, lazy loading, and optimized rendering
- **Accessibility**: WCAG compliant with full keyboard navigation
- **Responsive**: Mobile-first design that works on all devices

### 🚀 **Getting Started**
1. Clone the repository and install dependencies
2. Configure API keys through the settings interface
3. Start the development server
4. Explore content across all platforms
5. Customize settings and preferences

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- **YouTube** for the comprehensive Data API v3
- **TMDB** for the extensive movie and TV database
- **HiAnime** for the anime streaming API
- **RapidAPI** for the API marketplace and infrastructure
- **Jikan** for the MyAnimeList API integration
- **React team** for the amazing framework and ecosystem
- **Tailwind CSS** for the utility-first CSS framework
- **Redux team** for state management solutions
- **Vite** for the fast build tool and development server
- **TypeScript** for type safety and developer experience
- All the open source contributors and maintainers