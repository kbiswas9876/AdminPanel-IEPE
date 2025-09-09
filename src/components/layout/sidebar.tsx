'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { ErrorReportsNavItem } from './error-reports-nav-item'
import { 
  LayoutDashboard, 
  BookOpen, 
  Library, 
  Users, 
  FileText,
  Shield,
  ChevronRight,
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

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl backdrop-blur-xl">
      {/* Enhanced Header Section */}
      <div className="flex h-24 items-center justify-between px-6 border-b border-slate-700/50 bg-gradient-to-r from-slate-800/50 to-slate-700/30">
        <div className="flex items-center space-x-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 shadow-xl ring-2 ring-blue-400/20">
            <Shield className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-xs text-slate-400 font-medium">Mission Control Center</p>
          </div>
        </div>
        
        {/* Mobile Close Button */}
        <button
          onClick={onClose}
          className="lg:hidden p-2 rounded-lg hover:bg-slate-700/50 transition-colors"
        >
          <X className="h-5 w-5 text-slate-300" />
        </button>
      </div>

      {/* Enhanced Navigation Section */}
      <nav className="flex-1 space-y-3 px-4 py-6 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              onClick={() => onClose?.()}
              className={cn(
                'group relative flex items-center rounded-2xl px-4 py-4 text-sm font-medium transition-all duration-300 ease-out',
                'hover:scale-[1.02] hover:shadow-xl active:scale-[0.98] transform-gpu',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/30'
                  : 'text-slate-300 hover:bg-gradient-to-r hover:from-slate-700/60 hover:to-slate-600/40 hover:text-white hover:shadow-lg'
              )}
            >
              {/* Active indicator bar with enhanced styling */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-10 w-1.5 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-white to-blue-100 shadow-lg shadow-white/50" />
              )}
              
              {/* Icon with enhanced animations */}
              <div className={cn(
                'flex items-center justify-center w-10 h-10 rounded-xl transition-all duration-300 mr-4',
                isActive 
                  ? 'bg-white/20 shadow-lg' 
                  : 'bg-slate-700/50 group-hover:bg-slate-600/60 group-hover:scale-110'
              )}>
                <Icon className={cn(
                  'h-5 w-5 transition-all duration-300',
                  isActive 
                    ? 'text-white' 
                    : 'text-slate-400 group-hover:text-white group-hover:scale-110'
                )} />
              </div>
              
              {/* Text content with description */}
              <div className="flex-1 min-w-0">
                <div className="font-semibold tracking-wide text-base">{item.name}</div>
                <div className={cn(
                  'text-xs transition-colors duration-200',
                  isActive 
                    ? 'text-blue-100' 
                    : 'text-slate-500 group-hover:text-slate-300'
                )}>
                  {item.description}
                </div>
              </div>
              
              {/* Chevron for active item */}
              {isActive && (
                <ChevronRight className="h-4 w-4 text-white/80 ml-2 animate-pulse" />
              )}
              
              {/* Enhanced glow effect for active item */}
              {isActive && (
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/30 via-indigo-600/30 to-purple-600/30 blur-md -z-10" />
              )}
              
              {/* Hover effect overlay */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          )
        })}
        
        {/* Error Reports with enhanced styling */}
        <div className="pt-2">
          <ErrorReportsNavItem />
        </div>
      </nav>

      {/* Enhanced Footer Section */}
      <div className="border-t border-slate-700/50 p-4 bg-gradient-to-r from-slate-800/30 to-slate-700/20">
        <div className="rounded-2xl bg-gradient-to-r from-slate-800/60 to-slate-700/40 p-4 border border-slate-600/30 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="h-3 w-3 rounded-full bg-gradient-to-r from-green-400 to-emerald-500 animate-pulse shadow-lg shadow-green-400/50" />
              <div className="absolute inset-0 h-3 w-3 rounded-full bg-green-400/30 animate-ping" />
            </div>
            <div>
              <span className="text-sm font-semibold text-slate-200">System Online</span>
              <p className="text-xs text-slate-400 mt-0.5">All services operational</p>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-slate-600/30">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">Last updated</span>
              <span className="text-slate-300 font-medium">Just now</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
