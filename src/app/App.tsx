import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Suspense, lazy } from 'react'
import { store } from '../store'
import { ThemeProvider } from './providers/ThemeProvider'
import Layout from './Layout'
import LoadingSpinner from '../components/LoadingSpinner'
import { useAppSelector } from '../store'
import { selectIsTorrentEndpointConfigured } from '../store/slices/settingsSlice'

// Lazy load pages for code splitting
const YouTubePage = lazy(() => import('../pages/YouTubePage'))
const SearchPage = lazy(() => import('../pages/SearchPage'))
const WatchPage = lazy(() => import('../pages/WatchPage'))
const ChannelPage = lazy(() => import('../pages/ChannelPage'))
const ExplorePage = lazy(() => import('../pages/ExplorePage'))
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const WatchLaterPage = lazy(() => import('../pages/WatchLaterPage'))
const ContinueWatchingPage = lazy(() => import('../pages/ContinueWatchingPage'))
const AnimePage = lazy(() => import('../pages/AnimePage'))
const HiAnimePage = lazy(() => import('../pages/HiAnimePage'))
const HiAnimeWatchPage = lazy(() => import('../pages/HiAnimeWatchPage'))
const MoviesTVPage = lazy(() => import('../pages/MoviesTVPage'))
const TMDBWatchPage = lazy(() => import('../pages/TMDBWatchPage'))
const TorrentSearchPage = lazy(() => import('../pages/TorrentSearchPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))
const ChannelsPage = lazy(() => import('../pages/ChannelsPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

// Component that can access Redux store
function AppRoutes() {
  const isTorrentEndpointConfigured = useAppSelector(selectIsTorrentEndpointConfigured)

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={<YouTubePage />} />
        <Route path="/youtube" element={<YouTubePage />} />
        <Route path="/search" element={<SearchPage />} />
        <Route path="/watch/:videoId" element={<WatchPage />} />
        <Route path="/channel/:channelId" element={<ChannelPage />} />
        <Route path="/explore" element={<ExplorePage />} />
        <Route path="/anime" element={<AnimePage />} />
        <Route path="/anime/:animeId" element={<WatchPage />} />
        <Route path="/hianime" element={<HiAnimePage />} />
        <Route path="/hianime/:animeId" element={<HiAnimeWatchPage />} />
        <Route path="/movies-tv" element={<MoviesTVPage />} />
        <Route path="/tmdb-watch/:type/:id" element={<TMDBWatchPage />} />
        {isTorrentEndpointConfigured && <Route path="/torrents" element={<TorrentSearchPage />} />}
        <Route path="/subscriptions" element={<SubscriptionsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/watch-later" element={<WatchLaterPage />} />
        <Route path="/continue-watching" element={<ContinueWatchingPage />} />
        <Route path="/channels" element={<ChannelsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  )
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Layout>
            <AppRoutes />
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App
