import { type ReactNode, useState } from 'react'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import MockDataNotification from '../components/MockDataNotification'
import Settings from '../components/Settings'
import { useAppSelector } from '../store'

interface LayoutProps {
  children: ReactNode
}

const Layout = ({ children }: LayoutProps) => {
  const { sidebarOpen } = useAppSelector((state) => state.ui)
  const [settingsOpen, setSettingsOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white dark:bg-youtube-dark text-gray-900 dark:text-white">
      <Header />
      <div className="flex pt-14">
        <Sidebar />
        <main
          className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'ml-64' : 'ml-16'
          }`}
        >
          <MockDataNotification onOpenSettings={() => setSettingsOpen(true)} />
          {children}
        </main>
      </div>

      {/* Settings Modal */}
      <Settings 
        isOpen={settingsOpen} 
        onClose={() => setSettingsOpen(false)} 
      />
    </div>
  )
}

export default Layout
