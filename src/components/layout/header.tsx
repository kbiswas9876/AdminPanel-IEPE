'use client'

import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'
import { LogOut, User, Bell } from 'lucide-react'

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b border-gray-200/50">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
              <User className="h-4 w-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Welcome back, {user?.email}
              </h2>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Notification Bell */}
          <Button
            variant="ghost"
            size="sm"
            className="relative h-9 w-9 rounded-full hover:bg-gray-100 transition-colors"
          >
            <Bell className="h-4 w-4 text-gray-600" />
            {/* Notification dot */}
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
          </Button>
          
          {/* Logout Button */}
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
            className="flex items-center space-x-2 hover:bg-red-50 hover:border-red-200 hover:text-red-700 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </Button>
        </div>
      </div>
    </header>
  )
}


