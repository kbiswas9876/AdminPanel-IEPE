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

  const sidebarWidth = isCollapsed ? 'w-16' : (isMobile ? 'w-64' : 'w-72')
  const isExpanded = !isCollapsed

  return (
    <div 
      className={cn(
        "sidebar-split-header transition-all duration-300 ease-out",
        isMobile 
          ? "bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-ios-xl" 
          : "bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/30 shadow-2xl",
        sidebarWidth,
        isCollapsed && !isMobile && "overflow-hidden sidebar-collapsed"
      )}
      data-sidebar
    >
      {/* Conventional Header - Toggle Button at Top */}
      <div className={cn(
        "sidebar-logo-top border-b backdrop-blur-sm",
        isMobile 
          ? "h-16 px-ios-md border-slate-200/60 bg-white/80" 
          : isCollapsed 
            ? "h-16 px-3 border-slate-700/30 bg-gradient-to-r from-slate-800/40 to-slate-700/20"
            : "h-20 px-6 border-slate-700/30 bg-gradient-to-r from-slate-800/40 to-slate-700/20"
      )}>
        <div className="flex items-center justify-center">
          {/* Professional State-Changing Toggle Button */}
          {!isMobile && (
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className={cn(
                "sidebar-toggle-button p-3 rounded-lg transition-all duration-300 ease-out",
                "hover:bg-slate-700/50 hover:scale-105 active:scale-95",
                "text-slate-400 hover:text-white",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800"
              )}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <div className="relative w-5 h-5">
                {isCollapsed ? (
                  <Menu className="sidebar-toggle-icon h-5 w-5" />
                ) : (
                  <X className="sidebar-toggle-icon h-5 w-5" />
                )}
              </div>
            </button>
          )}
        </div>
      </div>

      {/* Professional Navigation Section - Flex Grow */}
      <nav className={cn(
        "sidebar-navigation-middle",
        isMobile 
          ? "space-y-1 px-ios-sm py-ios-md overflow-y-auto" 
          : isCollapsed 
            ? "space-y-2 px-2 py-4 overflow-hidden" 
            : "space-y-2 px-4 py-6 overflow-y-auto"
      )}>
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <div key={item.name} className="relative group">
              <Link
                href={item.href}
                className={cn(
                  'group relative flex items-center transition-all duration-200 ease-out',
                  isMobile 
                    ? 'rounded-lg px-ios-md py-ios-md text-body touch-target' 
                    : isCollapsed
                      ? 'rounded-lg px-2 py-3 justify-center w-full'
                      : 'rounded-lg px-4 py-4 text-sm',
                  isActive
                    ? isMobile 
                      ? 'bg-blue-500 text-white shadow-sm' 
                      : isCollapsed
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'bg-blue-600 text-white shadow-lg'
                    : isMobile
                      ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                      : isCollapsed
                        ? 'text-slate-400 hover:bg-slate-700/40 hover:text-white'
                        : 'text-slate-300 hover:bg-slate-700/40 hover:text-white'
                )}
              >
                {/* Clean Icon Container */}
                <div className={cn(
                  'flex items-center justify-center rounded-md transition-all duration-200 ease-out',
                  isMobile 
                    ? 'w-8 h-8 mr-3' 
                    : isCollapsed
                      ? 'w-8 h-8'
                      : 'w-9 h-9 mr-4',
                  isActive 
                    ? isMobile 
                      ? 'bg-white/20 shadow-sm' 
                      : isCollapsed
                        ? 'bg-white/20 shadow-sm'
                        : 'bg-white/20 shadow-sm'
                    : isMobile
                      ? 'bg-slate-100 group-hover:bg-slate-200'
                      : isCollapsed
                        ? 'bg-slate-700/50 group-hover:bg-slate-600/60'
                        : 'bg-slate-700/50 group-hover:bg-slate-600/60'
                )}>
                  <Icon className={cn(
                    'transition-all duration-200 ease-out',
                    'h-4 w-4',
                    isActive 
                      ? 'text-white' 
                      : isMobile
                        ? 'text-slate-600 group-hover:text-slate-800'
                        : 'text-slate-400 group-hover:text-white'
                  )} />
                </div>
              
                {/* Clean Text Content */}
                {isExpanded && (
                  <div className="flex-1 min-w-0 transition-all duration-200 ease-out opacity-100 translate-x-0">
                    <div className={cn(
                      'font-medium tracking-wide truncate transition-all duration-200',
                      isMobile ? 'text-body' : 'text-base',
                      isActive ? 'font-semibold' : 'font-medium'
                    )}>
                      {item.name}
                    </div>
                    {!isMobile && (
                      <div className={cn(
                        'text-xs transition-colors duration-200 truncate',
                        isActive 
                          ? 'text-blue-100' 
                          : 'text-slate-500 group-hover:text-slate-300'
                      )}>
                        {item.description}
                      </div>
                    )}
                  </div>
                )}
              </Link>

              {/* Professional Tooltip for Collapsed State */}
              {isCollapsed && !isMobile && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-md shadow-lg border border-slate-700/30 z-50 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ease-out pointer-events-none group-hover:pointer-events-auto whitespace-nowrap">
                  {item.name}
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-slate-800 rotate-45 border-l border-b border-slate-700/30"></div>
                </div>
              )}
              
            </div>
          )
        })}
        
        {/* Error Reports with mobile optimization */}
        <div className={cn("pt-1", isMobile ? "pt-2" : "pt-2")}>
          <ErrorReportsNavItem />
        </div>
      </nav>

      {/* Conventional Footer - Main Icon at Bottom */}
      <div className={cn(
        "sidebar-controls-bottom flex items-center justify-center border-t backdrop-blur-sm",
        isCollapsed 
          ? "px-3 py-3 border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10"
          : "px-6 py-4 border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10"
      )}>
        <div className="flex items-center space-x-3">
          <div className={cn(
            "flex items-center justify-center rounded-lg transition-all duration-300",
            isMobile 
              ? "h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-sm" 
              : "h-10 w-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg ring-1 ring-blue-400/20"
          )}>
            <Shield className="text-white h-5 w-5" />
          </div>
          {isExpanded && (
            <div className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-left-2 duration-300">
              <h1 className={cn(
                "font-bold tracking-tight truncate",
                isMobile 
                  ? "text-heading text-slate-900" 
                  : "text-lg text-white"
              )}>
                Admin Panel
              </h1>
              <p className={cn(
                "font-medium truncate",
                isMobile 
                  ? "text-caption text-slate-600" 
                  : "text-sm text-slate-300"
              )}>
                Mission Control Center
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Footer - System Status */}
      <div className={cn(
        "border-t backdrop-blur-sm",
        isMobile 
          ? "border-slate-200/60 bg-white/80 p-ios-sm" 
          : isCollapsed
            ? "border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10 p-2"
            : "border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10 p-4"
      )}>
        <div className={cn(
          "rounded-lg backdrop-blur-sm",
          isMobile 
            ? "bg-slate-50/80 border border-slate-200/60 shadow-sm p-ios-md" 
            : isCollapsed
              ? "bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-slate-600/20 shadow-lg p-2"
              : "bg-gradient-to-r from-slate-800/40 to-slate-700/30 border border-slate-600/20 shadow-lg p-4"
        )}>
          <div className={cn(
            "flex items-center",
            isCollapsed && !isMobile ? "justify-center" : "space-x-3"
          )}>
            <div className="relative">
              <div className="rounded-full bg-green-400 animate-pulse shadow-sm h-3 w-3" />
              <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping h-3 w-3" />
            </div>
            {isExpanded && (
              <div className="min-w-0 flex-1 animate-in fade-in-0 slide-in-from-left-2 duration-300">
                <span className={cn(
                  "font-semibold truncate",
                  isMobile 
                    ? "text-caption text-slate-700" 
                    : "text-sm text-slate-200"
                )}>
                  System Online
                </span>
                {!isMobile && (
                  <p className="text-xs text-slate-400 mt-0.5">All services operational</p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
