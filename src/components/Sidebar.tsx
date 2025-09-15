import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { setSearchQuery, toggleSidebar } from '../store/slices/uiSlice'
import { logout } from '../store/slices/authSlice'
import { selectIsTorrentEndpointConfigured } from '../store/slices/settingsSlice'
import { toggleFavorite, selectFavoriteItems, selectSidebarItems } from '../store/slices/favoritesSlice'
import SearchBar from './SearchBar'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const isTorrentEndpointConfigured = useAppSelector(selectIsTorrentEndpointConfigured)
  const favoriteItems = useAppSelector(selectFavoriteItems)
  const sidebarItems = useAppSelector(selectSidebarItems)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Get navigation items from Redux state, filtering out torrents if not configured
  const navigationItems = sidebarItems.filter(item => 
    item.id !== 'torrents' || isTorrentEndpointConfigured
  ).filter(item => 
    // Only show main navigation items (not library or account items)
    ['youtube', 'movies-tv', 'anime', 'hianime', 'torrents'].includes(item.id)
  )

  const isActive = (href: string) => {
    if (href === '/youtube') {
      return location.pathname === '/youtube' || location.pathname === '/'
    }
    return location.pathname.startsWith(href)
  }

  const isSettingsActive = () => {
    return location.pathname === '/settings'
  }

  const handleSearch = (query: string) => {
    dispatch(setSearchQuery(query))
    navigate(`/search?q=${encodeURIComponent(query)}`)
  }

  const handleLogout = () => {
    dispatch(logout())
    setShowUserMenu(false)
  }

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Prevent conflicts with other click handlers
      if (event.defaultPrevented) return
      
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside, { capture: true })
    return () => document.removeEventListener('mousedown', handleClickOutside, { capture: true })
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Prevent conflicts with other click handlers
      if (event.defaultPrevented) return
      
      if (sidebarOpen && !(event.target as Element).closest('.sidebar-modal')) {
        event.preventDefault()
        dispatch(toggleSidebar())
      }
    }

    if (sidebarOpen) {
      // Use capture phase to handle before other listeners
      document.addEventListener('mousedown', handleClickOutside, { capture: true })
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside, { capture: true })
      document.body.style.overflow = 'unset'
    }
  }, [sidebarOpen, dispatch])

  if (!sidebarOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" />
      
      {/* Floating Sidebar Modal */}
      <aside className="fixed bottom-24 left-6 w-80 bg-white dark:bg-youtube-dark border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl z-50 sidebar-modal">
      <nav className="h-full flex flex-col">
        {/* Logo Section */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <Link to="/" className="flex items-center space-x-2" onClick={() => dispatch(toggleSidebar())}>
            <div className="w-8 h-8 bg-youtube-red rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-white">TV</span>
          </Link>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide max-h-96">
          {/* Search Bar */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <SearchBar onSearch={handleSearch} />
          </div>

          <div className="py-4">
            {navigationItems.map((item, index) => {
              const isItemFavorite = favoriteItems.includes(item.id)
              return (
                <div key={index} className="flex items-center group">
                  <Link
                    to={item.href}
                    onClick={() => dispatch(toggleSidebar())}
                    className={`flex items-center flex-1 px-4 py-3 text-sm font-medium transition-colors ${
                      isActive(item.href)
                        ? 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                    }`}
                  >
                    <span className="mr-4 text-lg">
                      {item.icon}
                    </span>
                    <span className="truncate">{item.label}</span>
                  </Link>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      dispatch(toggleFavorite(item.id))
                    }}
                    className={`px-3 py-3 text-sm transition-colors opacity-0 group-hover:opacity-100 ${
                      isItemFavorite 
                        ? 'opacity-100 text-yellow-500 hover:text-yellow-600' 
                        : 'text-gray-400 hover:text-yellow-500'
                    }`}
                    aria-label={`${isItemFavorite ? 'Remove from' : 'Add to'} favorites`}
                  >
                    {isItemFavorite ? '⭐' : '☆'}
                  </button>
                </div>
              )
            })}
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Library
            </h3>
            <div className="space-y-1">
              {sidebarItems.filter(item => ['liked', 'playlists'].includes(item.id)).map((item) => {
                const isItemFavorite = favoriteItems.includes(item.id)
                return (
                  <div key={item.id} className="flex items-center group">
                    <Link
                      to={item.href}
                      onClick={() => dispatch(toggleSidebar())}
                      className="flex items-center flex-1 px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
                    >
                      <span className="mr-3">{item.icon}</span>
                      {item.label}
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        dispatch(toggleFavorite(item.id))
                      }}
                      className={`px-2 py-2 text-sm transition-colors opacity-0 group-hover:opacity-100 ${
                        isItemFavorite 
                          ? 'opacity-100 text-yellow-500 hover:text-yellow-600' 
                          : 'text-gray-400 hover:text-yellow-500'
                      }`}
                      aria-label={`${isItemFavorite ? 'Remove from' : 'Add to'} favorites`}
                    >
                      {isItemFavorite ? '⭐' : '☆'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Account Section - Above Settings */}
        <div className="mt-auto border-t border-gray-200 dark:border-gray-700">
          {/* User Account */}
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center w-full px-2 py-2 text-sm font-medium transition-colors rounded text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                aria-label="User menu"
              >
                <div className="mr-3 w-8 h-8 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                  <svg className="w-5 h-5 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Account</span>
              </button>

              {/* User Menu Dropdown */}
              {showUserMenu && (
                <div className="absolute left-0 bottom-full mb-2 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                  <div className="py-2">
                    {isAuthenticated ? (
                      <>
                        {sidebarItems.filter(item => ['channel', 'history', 'watch-later'].includes(item.id)).map((item) => {
                          const isItemFavorite = favoriteItems.includes(item.id)
                          return (
                            <div key={item.id} className="flex items-center group">
                              <Link
                                to={item.href}
                                onClick={() => {
                                  setShowUserMenu(false)
                                  dispatch(toggleSidebar())
                                }}
                                className="flex items-center flex-1 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <span className="mr-3">{item.icon}</span>
                                {item.label}
                              </Link>
                              <button
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  dispatch(toggleFavorite(item.id))
                                }}
                                className={`px-3 py-2 text-sm transition-colors opacity-0 group-hover:opacity-100 ${
                                  isItemFavorite 
                                    ? 'opacity-100 text-yellow-500 hover:text-yellow-600' 
                                    : 'text-gray-400 hover:text-yellow-500'
                                }`}
                                aria-label={`${isItemFavorite ? 'Remove from' : 'Add to'} favorites`}
                              >
                                {isItemFavorite ? '⭐' : '☆'}
                              </button>
                            </div>
                          )
                        })}
                        <hr className="my-2 border-gray-200 dark:border-gray-700" />
                        <button
                          onClick={handleLogout}
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="mr-3">🚪</span>
                          Sign out
                        </button>
                      </>
                    ) : (
                      <div className="px-4 py-2">
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          Sign in to subscribe to channels.
                        </p>
                        <button className="w-full btn-primary text-sm">
                          Sign in
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Settings Button */}
          <div className="p-4">
            <div className="flex items-center group">
              <Link
                to="/settings"
                onClick={() => dispatch(toggleSidebar())}
                className={`flex items-center flex-1 px-2 py-2 text-sm font-medium transition-colors rounded ${
                  isSettingsActive()
                    ? 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <span className="mr-3 text-lg">⚙️</span>
                <span>Settings</span>
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  dispatch(toggleFavorite('settings'))
                }}
                className={`px-3 py-2 text-sm transition-colors opacity-0 group-hover:opacity-100 ${
                  favoriteItems.includes('settings')
                    ? 'opacity-100 text-yellow-500 hover:text-yellow-600' 
                    : 'text-gray-400 hover:text-yellow-500'
                }`}
                aria-label={`${favoriteItems.includes('settings') ? 'Remove from' : 'Add to'} favorites`}
              >
                {favoriteItems.includes('settings') ? '⭐' : '☆'}
              </button>
            </div>
          </div>
        </div>

      </nav>
    </aside>
    </>
  )
}

export default Sidebar
