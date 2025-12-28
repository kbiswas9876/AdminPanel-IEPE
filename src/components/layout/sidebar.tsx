'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useMobile } from '@/lib/contexts/mobile-context'
import { cn } from '@/lib/utils'
import { ErrorReportsNavItem } from './error-reports-nav-item'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  Users, 
  FileText,
  Shield,
  ChevronRight,
  Menu,
  X
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & Analytics'
  },
  {
    name: 'Content Management',
    href: '/content',
    icon: BookOpen,
    description: 'Questions & Content'
  },
  {
    name: 'Book Manager',
    href: '/books',
    icon: Library,
    description: 'Book Library'
  },
  {
    name: 'Student Management',
    href: '/students',
    icon: Users,
    description: 'User Management'
  },
  {
    name: 'Mock Tests',
    href: '/tests',
    icon: FileText,
    description: 'Test Creation'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isMobile } = useMobile()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const sidebarWidth = isCollapsed ? 'w-16' : (isMobile ? 'w-64' : 'w-72')
  const isExpanded = !isCollapsed || isHovered

  return (
    <div 
      className={cn(
        "flex h-full flex-col transition-all duration-300 ease-out group",
        "bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95",
        "backdrop-blur-xl border-r border-slate-700/30 shadow-2xl",
        sidebarWidth
      )}
      data-sidebar
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Premium Glassmorphism Header */}
      <div className={cn(
        "flex items-center justify-between border-b border-slate-700/30 bg-gradient-to-r from-slate-800/40 to-slate-700/20 backdrop-blur-sm",
        isMobile ? "h-16 px-4" : "h-20 px-6"
      )}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            "flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg ring-1 ring-blue-400/20 transition-all duration-300",
            isMobile ? "h-8 w-8" : "h-10 w-10",
            isExpanded ? "scale-100" : "scale-90"
          )}>
            <Shield className={cn(
              "text-white transition-all duration-300",
              isMobile ? "h-4 w-4" : "h-5 w-5"
            )} />
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <h1 className={cn(
                "font-bold text-white tracking-tight truncate",
                isMobile ? "text-sm" : "text-lg"
              )}>
                Admin Panel
              </h1>
              <p className={cn(
                "text-slate-400 font-medium truncate",
                isMobile ? "text-xs" : "text-xs"
              )}>
                {isMobile ? "Control" : "Mission Control Center"}
              </p>
            </div>
          )}
        </div>
        
        {/* Collapse Toggle */}
        {!isMobile && (
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white transition-all duration-200"
          >
            {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
          </button>
        )}
      </div>

      {/* Premium Minimal Navigation */}
      <nav className={cn(
        "flex-1 overflow-y-auto",
        isMobile ? "space-y-1 px-3 py-4" : "space-y-2 px-4 py-6"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center transition-all duration-300 ease-out',
                'hover:scale-[1.02] active:scale-[0.98]',
                isMobile 
                  ? 'rounded-xl px-3 py-2.5 text-sm' 
                  : 'rounded-2xl px-4 py-4 text-sm',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/40 hover:text-white hover:shadow-md'
              )}
            >
              {/* Premium Active Pill Indicator */}
              {isActive && (
                <div className={cn(
                  "absolute left-0 top-1/2 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-white to-blue-100 shadow-sm",
                  isMobile ? "h-6 w-1" : "h-8 w-1.5"
                )} />
              )}
              
              {/* Icon Container with Premium Effects */}
              <div className={cn(
                'flex items-center justify-center rounded-xl transition-all duration-300',
                isMobile 
                  ? 'w-7 h-7 mr-3' 
                  : 'w-9 h-9 mr-4',
                isActive 
                  ? 'bg-white/20 shadow-sm ring-1 ring-white/20' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/60 group-hover:scale-110 group-hover:shadow-md'
              )}>
                <Icon className={cn(
                  'transition-all duration-300',
                  isMobile ? 'h-4 w-4' : 'h-4 w-4',
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                )} />
              </div>
              
              {/* Text Content with Smooth Animations */}
              {isExpanded && (
                <div className="flex-1 min-w-0 animate-in fade-in-0 slide-in-from-left-2 duration-300">
                  <div className={cn(
                    'font-medium tracking-wide truncate',
                    isMobile ? 'text-sm' : 'text-base',
                    isActive ? 'font-semibold' : 'font-medium'
                  )}>
                    {item.name}
                  </div>
                  {!isMobile && (
                    <div className={cn(
                      'text-xs transition-colors duration-300 truncate',
                      isActive 
                        ? 'text-blue-100' 
                        : 'text-slate-500 group-hover:text-slate-300'
                    )}>
                      {item.description}
                    </div>
                  )}
                </div>
              )}
              
              {/* Premium Active Indicator */}
              {isActive && isExpanded && (
                <ChevronRight className={cn(
                  'text-white/80 transition-all duration-300 animate-in fade-in-0 slide-in-from-right-2',
                  isMobile ? 'h-3 w-3 ml-1' : 'h-4 w-4 ml-2'
                )} />
              )}
              
              {/* Premium Active Glow Effect */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 via-indigo-600/20 to-purple-600/20 blur-sm -z-10" />
              )}
              
              {/* Premium Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          )
        })}
        
        {/* Error Reports with mobile optimization */}
        <div className={cn("pt-1", isMobile ? "pt-2" : "pt-2")}>
          <ErrorReportsNavItem />
        </div>
      </nav>

      {/* Premium Glassmorphism Footer */}
      <div className={cn(
        "border-t border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10 backdrop-blur-sm",
        isMobile ? "p-3" : "p-4"
      )}>
        <div className={cn(
          "rounded-xl bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-slate-600/20 shadow-lg backdrop-blur-sm",
          isMobile ? "p-3" : "p-4"
        )}>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <div className={cn(
                "rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-sm",
                isMobile ? "h-2 w-2" : "h-3 w-3"
              )} />
              <div className={cn(
                "absolute inset-0 rounded-full bg-green-400/30 animate-ping",
                isMobile ? "h-2 w-2" : "h-3 w-3"
              )} />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-left-2 duration-300">
                <span className={cn(
                  "font-semibold text-slate-200 truncate",
                  isMobile ? "text-xs" : "text-sm"
                )}>
                  System Online
                </span>
                {!isMobile && (
                  <p className="text-xs text-slate-400 mt-0.5">All services operational</p>
                )}
              </div>
            )}
          </div>
          {!isMobile && isExpanded && (
            <div className="mt-3 pt-3 border-t border-slate-600/20 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Last updated</span>
                <span className="text-slate-300 font-medium">Just now</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
