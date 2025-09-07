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
  Shield
} from 'lucide-react'

const navigation = [
  {
    name: 'Dashboard',
    href: '/',
    icon: LayoutDashboard,
  },
  {
    name: 'Content Management',
    href: '/content',
    icon: BookOpen,
  },
  {
    name: 'Book Manager',
    href: '/books',
    icon: Library,
  },
  {
    name: 'Student Management',
    href: '/students',
    icon: Users,
  },
  {
    name: 'Mock Tests',
    href: '/tests',
    icon: FileText,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <div className="flex h-full w-64 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 border-r border-slate-700/50 shadow-2xl">
      {/* Header Section */}
      <div className="flex h-20 items-center px-6 border-b border-slate-700/50">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
            <Shield className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Panel</h1>
            <p className="text-xs text-slate-400 font-medium">Command Center</p>
          </div>
        </div>
      </div>

      {/* Navigation Section */}
      <nav className="flex-1 space-y-2 px-4 py-6">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group relative flex items-center rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 ease-out',
                'hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]',
                isActive
                  ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/25'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              )}
            >
              {/* Active indicator bar */}
              {isActive && (
                <div className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-white/90 shadow-sm" />
              )}
              
              <Icon className={cn(
                'mr-3 h-5 w-5 transition-all duration-200',
                isActive 
                  ? 'text-white' 
                  : 'text-slate-400 group-hover:text-white group-hover:scale-110'
              )} />
              
              <span className="font-medium tracking-wide">{item.name}</span>
              
              {/* Subtle glow effect for active item */}
              {isActive && (
                <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-sm -z-10" />
              )}
            </Link>
          )
        })}
        
        {/* Error Reports with enhanced styling */}
        <div className="pt-2">
          <ErrorReportsNavItem />
        </div>
      </nav>

      {/* Footer Section */}
      <div className="border-t border-slate-700/50 p-4">
        <div className="rounded-lg bg-slate-800/50 p-3">
          <div className="flex items-center space-x-2">
            <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            <span className="text-xs font-medium text-slate-300">System Online</span>
          </div>
          <p className="text-xs text-slate-500 mt-1">All services operational</p>
        </div>
      </div>
    </div>
  )
}
