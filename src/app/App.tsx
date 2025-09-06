import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Provider } from 'react-redux'
import { Suspense, lazy } from 'react'
import { store } from '../store'
import { ThemeProvider } from './providers/ThemeProvider'
import Layout from './Layout'
import LoadingSpinner from '../components/LoadingSpinner'

// Lazy load pages for code splitting
const HomePage = lazy(() => import('../pages/HomePage'))
const SearchPage = lazy(() => import('../pages/SearchPage'))
const WatchPage = lazy(() => import('../pages/WatchPage'))
const ChannelPage = lazy(() => import('../pages/ChannelPage'))
const ExplorePage = lazy(() => import('../pages/ExplorePage'))
const SubscriptionsPage = lazy(() => import('../pages/SubscriptionsPage'))
const HistoryPage = lazy(() => import('../pages/HistoryPage'))
const WatchLaterPage = lazy(() => import('../pages/WatchLaterPage'))
const ContinueWatchingPage = lazy(() => import('../pages/ContinueWatchingPage'))
const AnimePage = lazy(() => import('../pages/AnimePage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider>
        <Router>
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/watch/:videoId" element={<WatchPage />} />
                <Route path="/channel/:channelId" element={<ChannelPage />} />
                <Route path="/explore" element={<ExplorePage />} />
                <Route path="/anime" element={<AnimePage />} />
                <Route path="/subscriptions" element={<SubscriptionsPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/watch-later" element={<WatchLaterPage />} />
                <Route path="/continue-watching" element={<ContinueWatchingPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </Suspense>
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  )
}

export default App
