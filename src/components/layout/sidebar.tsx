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

// Navigation with groups and keyboard shortcuts
const navigationGroups = [
  {
    title: 'Main',
    items: [
      {
        name: 'Dashboard',
        href: '/',
        icon: LayoutDashboard,
        description: 'Overview & Analytics',
        shortcut: '1'
      },
    ]
  },
  {
    title: 'Management',
    items: [
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
  }
]

// Flatten for easier iteration
const navigation = navigationGroups.flatMap(group => group.items)

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
      {/* Ultra-Premium Header with Branding */}
      <div className={cn(
        "sidebar-logo-top border-b backdrop-blur-xl flex items-center justify-between relative overflow-hidden",
        isMobile 
          ? "h-16 px-ios-md border-slate-200/60 bg-white/80" 
          : isCollapsed 
            ? "h-16 px-3 border-slate-700/30 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60"
            : "h-16 px-6 border-slate-700/30 bg-gradient-to-br from-slate-800/60 via-slate-800/40 to-slate-900/60"
      )}>
        {/* Subtle animated gradient overlay */}
        {!isMobile && (
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-blue-500/5"
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

        <div className="relative z-10 flex items-center justify-center w-full">
          {/* Logo or Branding (Collapsed State) */}
          {!isMobile && isCollapsed && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center justify-center"
            >
              <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-lg flex items-center justify-center ring-2 ring-slate-700/50">
                <Shield className="h-5 w-5 text-white" />
              </div>
            </motion.div>
          )}

          {/* Expanded State - Toggle + Brand */}
          {!isMobile && !isCollapsed && (
            <>
              <motion.button
                onClick={() => setIsCollapsed(!isCollapsed)}
                whileHover={{ scale: 1.05, backgroundColor: 'rgba(71, 85, 105, 0.5)' }}
                whileTap={{ scale: 0.95 }}
                className={cn(
                  "sidebar-toggle-button p-2.5 rounded-xl transition-all duration-200 relative group",
                  "bg-slate-700/30 hover:bg-slate-700/50 active:bg-slate-700/70",
                  "text-slate-400 hover:text-white border border-slate-600/30 hover:border-slate-500/50",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:ring-offset-2 focus:ring-offset-slate-800",
                  "shadow-lg hover:shadow-xl"
                )}
                aria-label="Collapse sidebar (Ctrl+B)"
                aria-expanded={!isCollapsed}
                title="Collapse sidebar (Ctrl+B)"
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key="expanded"
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="w-5 h-5"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </motion.div>
                </AnimatePresence>
                
                {/* Tooltip on hover */}
                <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-opacity z-50">
                  Ctrl+B
                </div>
              </motion.button>

              {/* Premium Brand Badge */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-slate-700/40 to-slate-600/30 border border-slate-600/30 backdrop-blur-sm"
              >
                <div className="h-6 w-6 rounded-md bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-md flex items-center justify-center">
                  <Shield className="h-3.5 w-3.5 text-white" />
                </div>
                <span className="text-xs font-bold text-slate-200 tracking-wide">ADMIN</span>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Enhanced Navigation Section with Groups and Animations */}
      <nav className={cn(
        "sidebar-navigation-middle",
        isMobile 
          ? "space-y-1 px-ios-sm py-ios-md overflow-y-auto" 
          : isCollapsed 
            ? "space-y-2 px-2 py-4 overflow-hidden" 
            : "space-y-3 px-4 py-6 overflow-y-auto"
      )}>
        {navigationGroups.map((group, groupIndex) => (
          <div key={group.title} className="space-y-2">
            {/* Premium Group Title with Divider */}
            {isExpanded && !isMobile && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: groupIndex * 0.05 }}
                className="px-3 pt-3 pb-2 flex items-center gap-2"
              >
                <div className="flex-1 flex items-center gap-2">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                  <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] px-2 py-1 rounded-md bg-slate-800/40 border border-slate-700/30">
                    {group.title}
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                </div>
              </motion.div>
            )}

            {/* Group Items with Stagger Animation */}
            {group.items.map((item, itemIndex) => {
              const isActive = pathname === item.href
              const isNavigating = navigatingTo === item.href
              const Icon = item.icon
              const globalIndex = groupIndex * 3 + itemIndex
              
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: globalIndex * 0.05,
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
                          : 'rounded-2xl px-4 py-3.5 text-sm',
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
                    {/* Enhanced Icon Container */}
                    <motion.div
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      className={cn(
                        'flex items-center justify-center rounded-lg transition-all duration-200',
                        isMobile 
                          ? 'w-8 h-8 mr-3' 
                          : isCollapsed
                            ? 'w-8 h-8'
                            : 'w-9 h-9 mr-3.5',
                        isActive 
                          ? 'bg-white/20 shadow-md' 
                          : isMobile
                            ? 'bg-slate-100 group-hover:bg-slate-200'
                            : 'bg-slate-700/50 group-hover:bg-slate-600/70'
                      )}
                    >
                      {isNavigating ? (
                        <Loader2 className="h-4 w-4 animate-spin text-white" />
                      ) : (
                        <Icon className={cn(
                          'transition-all duration-200',
                          'h-4 w-4',
                          isActive 
                            ? 'text-white' 
                            : isMobile
                              ? 'text-slate-600 group-hover:text-slate-800'
                              : 'text-slate-400 group-hover:text-white'
                        )} />
                      )}
                    </motion.div>
                  
                    {/* Enhanced Text Content with Shortcut */}
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="flex-1 min-w-0 flex items-center justify-between"
                      >
                        <div className="flex-1 min-w-0">
                          <div className={cn(
                            'font-medium tracking-wide truncate transition-colors duration-200',
                            isMobile ? 'text-body' : 'text-sm',
                            isActive ? 'font-semibold' : 'font-medium'
                          )}>
                            {item.name}
                          </div>
                          {!isMobile && (
                            <div className={cn(
                              'text-xs truncate transition-colors duration-200',
                              isActive 
                                ? 'text-blue-100' 
                                : 'text-slate-500 group-hover:text-slate-300'
                            )}>
                              {item.description}
                            </div>
                          )}
                        </div>
                        
                        {/* Premium Glassmorphic Shortcut Badge */}
                        {!isMobile && item.shortcut && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            className={cn(
                              "ml-2 px-2 py-1 rounded-md text-[10px] font-extrabold transition-all duration-200 backdrop-blur-sm border shadow-sm relative overflow-hidden",
                              isActive
                                ? "bg-white/20 text-white border-white/30 shadow-white/20"
                                : "bg-slate-700/50 text-slate-400 border-slate-600/30 group-hover:bg-slate-600/60 group-hover:text-slate-200 group-hover:border-slate-500/50 group-hover:shadow-md"
                            )}
                          >
                            <span className="relative z-10">{item.shortcut}</span>
                            {isActive && (
                              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                            )}
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </Link>

                  {/* Enhanced Tooltip for Collapsed State */}
                  <AnimatePresence>
                    {isCollapsed && !isMobile && (
                      <motion.div
                        initial={{ opacity: 0, x: -10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: -10, scale: 0.9 }}
                        transition={{ duration: 0.15 }}
                        className="absolute left-full top-1/2 -translate-y-1/2 ml-3 px-3 py-2 bg-slate-800 text-white text-sm font-medium rounded-lg shadow-xl border border-slate-700/30 z-50 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                          <span>{item.name}</span>
                          {item.shortcut && (
                            <kbd className="px-1.5 py-0.5 text-[10px] bg-slate-700 rounded">
                              {item.shortcut}
                            </kbd>
                          )}
                        </div>
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1.5 w-3 h-3 bg-slate-800 rotate-45 border-l border-b border-slate-700/30"></div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )
            })}
          </div>
        ))}
        
        {/* Error Reports with Enhanced Animation */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: navigation.length * 0.05 + 0.1 }}
          className={cn("pt-3", isMobile ? "pt-2" : "pt-3")}
        >
          {isExpanded && !isMobile && (
            <div className="px-3 pb-2 flex items-center gap-2">
              <div className="flex-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-[0.15em] px-2 py-1 rounded-md bg-slate-800/40 border border-slate-700/30">
                  Monitoring
                </span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700/50 to-transparent" />
              </div>
            </div>
          )}
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
