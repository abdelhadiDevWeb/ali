'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { 
  User, 
  FolderOpen, 
  Music, 
  Award,
  Briefcase,
  Menu,
  X,
  LogOut
} from 'lucide-react'

interface DashboardLayoutProps {
  children: React.ReactNode
  currentPage: string
}

export default function DashboardLayout({ children, currentPage }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loggingOut, setLoggingOut] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const basePath = '/dashbord/@65@&@/alilou_kermiche'

  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      const data = await response.json()

      if (response.ok && data.success) {
        // Redirect to home page
        router.push('/')
        router.refresh()
      } else {
        console.error('Logout failed:', data.error)
        alert('Logout failed. Please try again.')
      }
    } catch (error) {
      console.error('Logout error:', error)
      alert('Logout failed. Please try again.')
    } finally {
      setLoggingOut(false)
    }
  }
  
  // Handle navigation - append page name to base path
  const getPagePath = (page: string) => {
    if (page === 'profile') return `${basePath}`
    return `${basePath}/${page}`
  }

  const menuItems = [
    { icon: User, label: 'Profile', path: `${basePath}`, key: 'profile' },
    { icon: FolderOpen, label: 'Categories', path: `${basePath}/category`, key: 'category' },
    { icon: Music, label: 'Audio', path: `${basePath}/audio`, key: 'audio' },
    { icon: Award, label: 'Certifications', path: `${basePath}/certification`, key: 'certification' },
    { icon: Briefcase, label: 'Works', path: `${basePath}/work`, key: 'work' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 glass border-b border-slate-200/50 dark:border-slate-800/50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            Dashboard
          </h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-xl hover:bg-white/50 dark:hover:bg-slate-800/50 transition-all duration-200"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <div className="flex">
        {/* Sidebar */}
        <aside
          className={`
            fixed lg:sticky top-0 left-0 h-screen z-40
            glass border-r border-slate-200/50 dark:border-slate-800/50
            transition-all duration-500 ease-out
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            w-72 lg:w-80
            shadow-xl lg:shadow-none
          `}
        >
          <div className="flex flex-col h-full p-6">
            {/* Logo/Header */}
            <div className="mb-8 pt-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg">A</span>
                </div>
                <div>
                  <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                    Admin Panel
                  </h1>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Control Center
                  </p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-1.5">
              {menuItems.map((item, index) => {
                const Icon = item.icon
                const isActive = currentPage === item.key
                
                return (
                  <Link
                    key={item.key}
                    href={item.path}
                    className={`
                      flex items-center gap-3 px-4 py-3 rounded-xl
                      transition-all duration-300 ease-out
                      group relative overflow-hidden
                      animate-fade-in
                      ${isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' 
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 hover:scale-[1.01]'
                      }
                    `}
                    onClick={() => setSidebarOpen(false)}
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className={`
                      transition-all duration-300
                      ${isActive ? 'scale-110 rotate-3' : 'group-hover:scale-110 group-hover:rotate-3'}
                    `}>
                      <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    </div>
                    <span className={`font-medium ${isActive ? 'font-semibold' : ''}`}>
                      {item.label}
                    </span>
                    {isActive && (
                      <div className="absolute right-2 w-2 h-2 bg-white rounded-full animate-pulse" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50/80 dark:hover:bg-red-900/20 transition-all duration-200 mt-4 group disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <LogOut size={20} className={`group-hover:translate-x-1 transition-transform duration-200 ${loggingOut ? 'animate-spin' : ''}`} />
              <span className="font-medium">{loggingOut ? 'Logging out...' : 'Logout'}</span>
            </button>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {sidebarOpen && (
          <div
            className="lg:hidden fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity duration-300"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Main Content */}
        <main className="flex-1 lg:ml-0 min-h-screen">
          <div className="p-4 lg:p-6 xl:p-8">
            <div className="max-w-7xl mx-auto">
              <div className="animate-fade-in">
                {children}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
