import { type ReactNode, useState } from 'react'
import Sidebar from '../components/Sidebar'
import FloatingSidebarButton from '../components/FloatingSidebarButton'
import FavoriteIcons from '../components/FavoriteIcons'
import MockDataNotification from '../components/MockDataNotification'
import Settings from '../components/Settings'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-youtube-dark text-gray-900 dark:text-white">
      {/* Floating Sidebar Modal */}
      <Sidebar />
      
      {/* Main Content - Full Width */}
      <main className="w-full">
        <MockDataNotification onOpenSettings={() => setSettingsOpen(true)} />
        {children}
      </main>

      {/* Floating Sidebar Button */}
      <FloatingSidebarButton />

      {/* Favorite Icons */}
      <FavoriteIcons />

      {/* Settings Modal */}
      <Settings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  )
}

export default Layout
