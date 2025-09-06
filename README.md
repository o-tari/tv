# TV App

A production-ready TV-style web application built with React, TypeScript, and the YouTube Data API v3.

## Features

- 🏠 **Home Feed**: Trending videos with infinite scroll and skeleton loading
- 🔍 **Search**: Query suggestions, filters (type, duration, upload date), pagination
- ▶️ **Watch Page**: IFrame player, video details, channel card, subscribe button, related videos, comments
- 📺 **Channel Page**: Banner, avatar, subscribe state, videos tab, playlists tab, about tab
- 🌐 **Explore**: Categories (Music, Gaming, News, etc.)
- 📚 **History & Watch Later**: Persisted in localStorage
- 🎨 **Responsive Design**: Mobile-first with dark/light theme support
- ⌨️ **Keyboard Shortcuts**: "/" focus search, "k" play/pause, "j/l" seek, "f" fullscreen
- ♿ **Accessibility**: ARIA roles, keyboard navigation, skip-to-content link

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
- YouTube Data API v3 key (optional - app works with mock data by default)

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

The app uses a settings modal for all API settings. No environment variables are needed:

1. Click the settings icon in the header
2. Enter your YouTube API key (get one from [Google Cloud Console](https://console.cloud.google.com/))
3. Configure region code (e.g., US, GB, JP) and language (e.g., en, es, fr)
4. Save your settings

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
├── app/                    # App settings
│   ├── App.tsx            # Main app component
│   ├── Layout.tsx         # Layout wrapper
│   └── providers/         # Context providers
├── components/            # Reusable UI components
│   ├── Header.tsx         # Navigation header
│   ├── Sidebar.tsx        # Navigation sidebar
│   ├── VideoCard.tsx      # Video card component
│   ├── VideoGrid.tsx      # Video grid layout
│   ├── YouTubePlayer.tsx  # YouTube IFrame player
│   └── ...
├── features/              # Feature-specific components
│   ├── home/              # Home page components
│   ├── search/            # Search page components
│   ├── watch/             # Watch page components
│   ├── channel/           # Channel page components
│   ├── explore/           # Explore page components
│   └── history/           # History page components
├── hooks/                 # Custom React hooks
│   ├── useVideo.ts        # Video-related hooks
│   ├── useChannel.ts      # Channel-related hooks
│   └── useComments.ts     # Comments-related hooks
├── pages/                 # Page components
│   ├── HomePage.tsx       # Home page
│   ├── SearchPage.tsx     # Search page
│   ├── WatchPage.tsx      # Watch page
│   ├── ChannelPage.tsx    # Channel page
│   ├── ExplorePage.tsx    # Explore page
│   ├── HistoryPage.tsx    # History page
│   └── WatchLaterPage.tsx # Watch later page
├── services/              # API services
│   └── youtube.ts         # YouTube API client
├── store/                 # Redux store
│   ├── index.ts           # Store settings
│   └── slices/            # Redux slices
│       ├── authSlice.ts   # Authentication state
│       ├── uiSlice.ts     # UI state
│       ├── historySlice.ts # History state
│       └── videosSlice.ts # Videos state
└── utils/                 # Utility functions
    ├── formatTime.ts      # Time formatting utilities
    ├── formatNumber.ts    # Number formatting utilities
    └── sanitizeHTML.ts    # HTML sanitization utilities
```

## API Usage

The app uses the YouTube Data API v3 with the following endpoints:

- `search.list` - Search for videos, channels, playlists
- `videos.list` - Get video details and trending videos
- `channels.list` - Get channel information
- `commentThreads.list` - Get video comments
- `playlistItems.list` - Get playlist items
- `videoCategories.list` - Get video categories

## Performance Features

- **Code Splitting**: Lazy loading per route
- **Infinite Scroll**: Efficient pagination
- **Skeleton Loading**: Better perceived performance
- **React.memo**: Prevent unnecessary re-renders
- **Image Lazy Loading**: Optimize image loading

## Accessibility Features

- **ARIA Labels**: Screen reader support
- **Keyboard Navigation**: Full keyboard accessibility
- **Skip Links**: Quick navigation
- **Focus Management**: Proper focus handling
- **Color Contrast**: WCAG compliant colors

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

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

- YouTube for the API
- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Redux team for state management
- All the open source contributors