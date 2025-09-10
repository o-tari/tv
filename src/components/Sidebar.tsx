import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useRef, useEffect } from 'react'
import { useAppSelector, useAppDispatch } from '../store'
import { setSearchQuery, toggleSidebar } from '../store/slices/uiSlice'
import { logout } from '../store/slices/authSlice'
import SearchBar from './SearchBar'

const Sidebar = () => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useAppDispatch()
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const { isAuthenticated } = useAppSelector((state) => state.auth)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const navigationItems = [
    { label: 'YouTube', href: '/youtube', icon: '📺' },
    { label: 'Movies & TV', href: '/movies-tv', icon: '🎬' },
    { label: 'Anime', href: '/anime', icon: '🎌' },
    { label: 'HiAnime', href: '/hianime', icon: '🌸' },
    { label: 'Torrent Search', href: '/torrents', icon: '🔍' },
  ]

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
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Close sidebar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarOpen && !(event.target as Element).closest('.sidebar-modal')) {
        dispatch(toggleSidebar())
      }
    }

    if (sidebarOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
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
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                to={item.href}
                onClick={() => dispatch(toggleSidebar())}
                className={`flex items-center px-4 py-3 text-sm font-medium transition-colors ${
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
            ))}
          </div>

          <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
              Library
            </h3>
            <div className="space-y-1">
              <Link
                to="/library/liked"
                onClick={() => dispatch(toggleSidebar())}
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="mr-3">👍</span>
                Liked videos
              </Link>
              <Link
                to="/library/playlists"
                onClick={() => dispatch(toggleSidebar())}
                className="flex items-center px-2 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              >
                <span className="mr-3">📋</span>
                Playlists
              </Link>
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
                        <Link
                          to="/channel/me"
                          onClick={() => {
                            setShowUserMenu(false)
                            dispatch(toggleSidebar())
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="mr-3">👤</span>
                          Your channel
                        </Link>
                        <Link
                          to="/history"
                          onClick={() => {
                            setShowUserMenu(false)
                            dispatch(toggleSidebar())
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="mr-3">🕒</span>
                          History
                        </Link>
                        <Link
                          to="/watch-later"
                          onClick={() => {
                            setShowUserMenu(false)
                            dispatch(toggleSidebar())
                          }}
                          className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                          <span className="mr-3">⏰</span>
                          Watch later
                        </Link>
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
            <Link
              to="/settings"
              onClick={() => dispatch(toggleSidebar())}
              className={`flex items-center w-full px-2 py-2 text-sm font-medium transition-colors rounded ${
                isSettingsActive()
                  ? 'bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <span className="mr-3 text-lg">⚙️</span>
              <span>Settings</span>
            </Link>
          </div>
        </div>

      </nav>
    </aside>
    </>
  )
}

export default Sidebar
