'use client'

import { Sidebar } from './sidebar'
import { Header } from './header'
import { MobileProvider, useMobile } from '@/lib/contexts/mobile-context'
import { QuestionsProvider } from '@/lib/contexts/questions-context'

interface MainLayoutProps {
  children: React.ReactNode
}

function MainLayoutContent({ children }: MainLayoutProps) {
  const { isSidebarOpen, isMobile, setIsSidebarOpen } = useMobile()

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/30">
      {/* Ultra-Premium Mobile Sidebar */}
      <div className={`
        ${isMobile ? 'fixed inset-y-0 left-0 z-50 w-64' : 'relative w-72'}
        ${isMobile && !isSidebarOpen ? '-translate-x-full' : ''}
        transition-all duration-300 ease-out transform-gpu
        ${isMobile ? 'shadow-2xl' : ''}
      `}>
        <Sidebar />
      </div>

      {/* Ultra-Premium Mobile Overlay */}
      {isMobile && isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity duration-300 ease-out"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-transparent">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <MobileProvider>
      <QuestionsProvider>
        <MainLayoutContent>{children}</MainLayoutContent>
      </QuestionsProvider>
    </MobileProvider>
  )
}


