'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useMobile } from '@/lib/contexts/mobile-context'
import { useNavigationBlocker } from '@/lib/contexts/navigation-blocker-context'
import { cn } from '@/lib/utils'
import { ErrorReportsNavItem } from './error-reports-nav-item'
import { useState, useCallback, useEffect, useTransition } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  Users, 
  FileText,
  Shield,
  Menu,
  X,
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

// Simple flat navigation with keyboard shortcuts
const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
    description: 'Overview & Analytics',
    shortcut: '1'
  },
  {
    name: 'Content Management',
    href: '/content',
    icon: BookOpen,
    description: 'Questions & Content',
    shortcut: '2'
  },
  {
    name: 'Book Manager',
    href: '/books',
    icon: Library,
    description: 'Book Library',
    shortcut: '3'
  },
  {
    name: 'Student Management',
    href: '/students',
    icon: Users,
    description: 'User Management',
    shortcut: '4'
  },
  {
    name: 'Mock Tests',
    href: '/tests',
    icon: FileText,
    description: 'Test Creation',
    shortcut: '5'
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const { isMobile, setIsSidebarOpen } = useMobile()
  const { confirmNavigation } = useNavigationBlocker()
  const [isPending, startTransition] = useTransition()
  const [navigatingTo, setNavigatingTo] = useState<string | null>(null)
  
  // Persist collapse state in localStorage
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window !== 'undefined' && !isMobile) {
      return localStorage.getItem('sidebar-collapsed') === 'true'
    }
    return false
  })

  // Persist collapse state to localStorage
  useEffect(() => {
    if (!isMobile) {
      localStorage.setItem('sidebar-collapsed', String(isCollapsed))
    }
  }, [isCollapsed, isMobile])

  // Prefetch all routes on mount (fix memory leak)
  useEffect(() => {
    navigation.forEach(item => {
      router.prefetch(item.href)
    })
  }, [router])

  // Handle navigation with confirmation and loading state
  const handleNavigation = useCallback(async (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (pathname === href) return // Already on this page
    
    e.preventDefault()
    setNavigatingTo(href)
    
    const confirmed = await confirmNavigation()
    
    if (confirmed) {
      startTransition(() => {
        router.push(href)
        // Close mobile sidebar after navigation
        if (isMobile) {
          setTimeout(() => setIsSidebarOpen(false), 150)
        }
      })
      // Reset navigating state after a short delay
      setTimeout(() => setNavigatingTo(null), 500)
    } else {
      setNavigatingTo(null)
    }
  }, [pathname, confirmNavigation, router, isMobile, setIsSidebarOpen])

  // Reset navigatingTo when pathname changes (navigation completed)
  useEffect(() => {
    setNavigatingTo(null)
  }, [pathname])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input
      const target = e.target as HTMLElement
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
        return
      }

      // Ctrl/Cmd + B to toggle sidebar (desktop only)
      if ((e.ctrlKey || e.metaKey) && e.key === 'b' && !isMobile) {
        e.preventDefault()
        setIsCollapsed(prev => !prev)
      }

      // Number keys 1-5 for quick navigation
      if (e.key >= '1' && e.key <= '5' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const index = parseInt(e.key) - 1
        if (navigation[index]) {
          e.preventDefault()
          router.push(navigation[index].href)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [router, isMobile])

  const sidebarWidth = isCollapsed ? 'w-16' : (isMobile ? 'w-64' : 'w-72')
  const isExpanded = !isCollapsed

  return (
    <motion.div
      initial={false}
      animate={{
        width: isCollapsed && !isMobile ? '4rem' : isMobile ? '16rem' : '18rem'
      }}
      transition={{
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1]
      }}
      className={cn(
        "sidebar-split-header relative",
        isMobile 
          ? "bg-white/95 backdrop-blur-xl border-r border-slate-200/60 shadow-ios-xl" 
          : "bg-gradient-to-b from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-xl border-r border-slate-700/30 shadow-2xl",
        isCollapsed && !isMobile && "overflow-hidden sidebar-collapsed"
      )}
      data-sidebar
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Header Section */}
      <div className={cn(
        "sidebar-logo-top border-b backdrop-blur-xl relative overflow-hidden flex-shrink-0",
        isMobile 
          ? "border-slate-200/60 bg-white/80 px-ios-md py-4" 
          : "border-slate-700/30 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60"
      )}>
        {/* Animated gradient overlay */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5 pointer-events-none"
            animate={{
              x: ['-100%', '100%'],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        )}

        {/* Collapsed State */}
        {!isMobile && isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex flex-col items-center py-3"
          >
            {/* Logo Only */}
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-white" />
            </div>
          </motion.div>
        )}

        {/* Expanded State */}
        {!isMobile && !isCollapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="relative z-10 flex items-center justify-between gap-4 px-4 py-3"
          >
            {/* Logo + Text */}
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-md flex items-center justify-center flex-shrink-0">
                <Shield className="h-4 w-4 text-white" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-bold text-white tracking-wide truncate">ADMIN</span>
                <span className="text-[10px] text-slate-400 font-medium truncate">Mission Control</span>
              </div>
            </div>

            {/* Toggle Button */}
            <button
              onClick={() => setIsCollapsed(true)}
              className={cn(
                "group p-1.5 rounded-lg transition-all duration-200 flex-shrink-0",
                "bg-slate-800/50 hover:bg-slate-700/70",
                "border border-slate-700/50 hover:border-slate-600",
                "focus:outline-none focus:ring-2 focus:ring-blue-500/30"
              )}
              aria-label="Collapse sidebar (Ctrl+B)"
            >
              <ChevronLeft className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
            </button>
          </motion.div>
        )}
      </div>

      {/* Toggle Button Section (Collapsed State Only) */}
      {!isMobile && isCollapsed && (
        <div className="flex-shrink-0 flex justify-center py-3 border-b border-slate-700/20">
          <button
            onClick={() => setIsCollapsed(false)}
            className={cn(
              "group p-2 rounded-lg transition-all duration-200",
              "bg-slate-800/50 hover:bg-slate-700/70",
              "border border-slate-700/50 hover:border-slate-600",
              "focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            )}
            aria-label="Expand sidebar (Ctrl+B)"
          >
            <Menu className="h-4 w-4 text-slate-400 group-hover:text-white transition-colors" />
          </button>
        </div>
      )}

      {/* Clean Navigation Section */}
      <nav className={cn(
        "sidebar-navigation-middle flex-1",
        isMobile 
          ? "space-y-1 px-ios-sm py-ios-md overflow-y-auto" 
          : isCollapsed 
            ? "space-y-3 px-2 py-6 overflow-hidden" 
            : "space-y-1.5 px-3 py-6 overflow-y-auto"
      )}>
        {navigation.map((item, itemIndex) => {
          const isActive = pathname === item.href
          const isNavigating = navigatingTo === item.href
          const Icon = item.icon
              
          return (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                delay: itemIndex * 0.05,
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              className="relative group"
            >
                  <Link
                    href={item.href}
                    onClick={(e) => handleNavigation(e, item.href)}
                    aria-current={isActive ? 'page' : undefined}
                    className={cn(
                      'group relative flex items-center transition-all duration-300 overflow-hidden',
                      isMobile 
                        ? 'rounded-lg px-ios-md py-ios-md text-body touch-target' 
                        : isCollapsed
                          ? 'rounded-xl px-2 py-3 justify-center w-full'
                          : 'rounded-xl px-3 py-2.5 text-sm',
                      isActive
                        ? isMobile 
                          ? 'bg-blue-500 text-white apple-shadow-sm' 
                          : 'bg-gradient-to-r from-blue-600 via-blue-500 to-indigo-600 text-white shadow-xl shadow-blue-500/40 scale-[1.02] border border-blue-400/30'
                        : isMobile
                          ? 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                          : isCollapsed
                            ? 'text-slate-400 bg-slate-800/30 hover:bg-slate-700/60 hover:text-white hover:scale-105 hover:shadow-lg border border-transparent hover:border-slate-600/50'
                            : 'text-slate-300 bg-slate-800/30 hover:bg-slate-700/60 hover:text-white hover:scale-[1.02] hover:shadow-lg border border-transparent hover:border-slate-600/50'
                    )}
                  >
                    {/* Glow effect on active item */}
                    {isActive && !isMobile && (
                      <motion.div
                        className="absolute inset-0 bg-gradient-to-r from-blue-400/20 via-transparent to-blue-400/20"
                        animate={{
                          x: ['-100%', '100%'],
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "linear"
                        }}
                      />
                    )}
                    {/* Clean Icon Container */}
                    <div className={cn(
                      'flex items-center justify-center rounded-lg transition-all duration-200 flex-shrink-0',
                      isMobile 
                        ? 'w-8 h-8 mr-3' 
                        : isCollapsed
                          ? 'w-9 h-9'
                          : 'w-8 h-8 mr-3',
                      isActive 
                        ? 'bg-white/20' 
                        : isMobile
                          ? 'bg-slate-100 group-hover:bg-slate-200'
                          : 'bg-slate-700/40 group-hover:bg-slate-600/60'
                    )}>
                      {isNavigating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Icon className={cn(
                          'transition-all duration-200',
                          isMobile ? 'h-4 w-4' : 'h-[18px] w-[18px]',
                          isActive 
                            ? 'text-white' 
                            : isMobile
                              ? 'text-slate-600 group-hover:text-slate-800'
                              : 'text-slate-400 group-hover:text-white'
                        )} />
                      )}
                    </div>
                  
                    {/* Clean Text Content with Shortcut */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 min-w-0 flex items-center justify-between"
                      >
                        <span className={cn(
                          'font-medium tracking-wide truncate transition-colors duration-200',
                          isMobile ? 'text-body' : 'text-sm',
                          isActive ? 'font-semibold' : 'font-medium'
                        )}>
                          {item.name}
                        </span>
                        
                        {/* Clean Shortcut Badge */}
                        {!isMobile && item.shortcut && (
                          <span className={cn(
                            "ml-auto pl-3 text-[10px] font-bold transition-all duration-200",
                            isActive
                              ? "text-white/90"
                              : "text-slate-500 group-hover:text-slate-300"
                          )}>
                            {item.shortcut}
                          </span>
                        )}
                      </motion.div>
                    )}
                  </Link>

                  {/* Enhanced Tooltip for Collapsed State & Hover */}
                  <AnimatePresence>
                    {!isMobile && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className={cn(
                          "absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white rounded-lg shadow-xl border border-slate-700/30 z-50 opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap",
                          isCollapsed ? "" : "hidden"
                        )}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold">{item.name}</span>
                            {item.shortcut && (
                              <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700 rounded font-mono">
                                {item.shortcut}
                              </kbd>
                            )}
                          </div>
                          <p className="text-xs text-slate-400">{item.description}</p>
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700/30"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
            </motion.div>
          )
        })}
        
        {/* Error Reports */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: navigation.length * 0.05 + 0.1 }}
        >
          <ErrorReportsNavItem />
        </motion.div>
      </nav>

      {/* Consolidated Premium Footer with Animation */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={cn(
          "border-t backdrop-blur-sm",
          isMobile 
            ? "border-slate-200/60 bg-white/80 p-ios-md" 
            : isCollapsed
              ? "border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10 p-3"
              : "border-slate-700/30 bg-gradient-to-r from-slate-800/20 to-slate-700/10 p-4"
        )}
      >
        <div className={cn(
          "rounded-xl backdrop-blur-sm border transition-all duration-300",
          isMobile 
            ? "bg-slate-50/80 border-slate-200/60 shadow-sm p-3" 
            : isCollapsed
              ? "bg-gradient-to-r from-slate-800/40 to-slate-700/30 border-slate-600/20 shadow-lg p-2.5"
              : "bg-gradient-to-r from-slate-800/40 to-slate-700/30 border-slate-600/20 shadow-lg p-4"
        )}>
          {/* Branding + Status Combined */}
          <div className={cn(
            "flex items-center",
            isCollapsed && !isMobile ? "flex-col gap-3" : "gap-3"
          )}>
            {/* Brand Icon */}
            <motion.div
              whileHover={{ scale: 1.1, rotate: 5 }}
              className={cn(
                "flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-300",
                isMobile 
                  ? "h-10 w-10 bg-gradient-to-br from-blue-500 to-indigo-600 shadow-md" 
                  : "h-10 w-10 bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg ring-2 ring-blue-400/20"
              )}
            >
              <Shield className="text-white h-5 w-5" />
            </motion.div>

            {/* Brand Text + Status */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  className="flex-1 min-w-0"
                >
                  {/* Brand */}
                  <div className="mb-2">
                    <h1 className={cn(
                      "font-bold tracking-tight truncate leading-none",
                      isMobile 
                        ? "text-base text-slate-900" 
                        : "text-sm text-white"
                    )}>
                      Admin Panel
                    </h1>
                    <p className={cn(
                      "text-xs font-medium truncate mt-0.5",
                      isMobile 
                        ? "text-slate-600" 
                        : "text-slate-400"
                    )}>
                      Mission Control
                    </p>
                  </div>

                  {/* System Status */}
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: [1, 1.2, 1],
                          opacity: [1, 0.8, 1]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="rounded-full bg-green-400 shadow-sm h-2 w-2"
                      />
                      <motion.div
                        animate={{
                          scale: [1, 1.5, 1],
                          opacity: [0.5, 0, 0.5]
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="absolute inset-0 rounded-full bg-green-400 h-2 w-2"
                      />
                    </div>
                    <span className={cn(
                      "text-xs font-semibold",
                      isMobile 
                        ? "text-slate-700" 
                        : "text-slate-300"
                    )}>
                      System Online
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Collapsed State - Just Status Dot */}
            {isCollapsed && !isMobile && (
              <div className="relative">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [1, 0.8, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="rounded-full bg-green-400 shadow-sm h-2.5 w-2.5"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.5, 1],
                    opacity: [0.5, 0, 0.5]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 rounded-full bg-green-400 h-2.5 w-2.5"
                />
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
