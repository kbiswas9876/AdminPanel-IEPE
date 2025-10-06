'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth'
import { useMobile } from '@/lib/contexts/mobile-context'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { LogOut, User, Loader2, Menu, X, Settings, ChevronDown } from 'lucide-react'
import { NotificationBell } from '@/components/layout/notification-bell'
import { getCurrentAdminFullProfile, type AdminProfileData } from '@/lib/actions/admin-profile'
import { clearProfileCache } from '@/components/auth/protected-route'

export function Header() {
  const { user, signOut } = useAuth()
  const { isMobile, isSidebarOpen, toggleSidebar } = useMobile()
  const router = useRouter()
  const [adminProfile, setAdminProfile] = useState<AdminProfileData | null>(null)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleSignOut = async () => {
    setIsLoggingOut(true)
    try {
      // Clear profile cache before signing out
      clearProfileCache()
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }

  // Fetch admin profile on component mount
  useEffect(() => {
    const fetchProfile = async () => {
      const profile = await getCurrentAdminFullProfile()
      setAdminProfile(profile)
    }
    
    if (user) {
      fetchProfile()
    }
  }, [user])


  return (
    <header className="bg-white/95 backdrop-blur-md shadow-lg border-b border-gray-200/60 sticky top-0 z-40 smooth-animation">
      <div className="flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center space-x-4">
          {/* Mobile hamburger menu */}
          {isMobile && (
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleSidebar}
              className="h-10 w-10 p-0 hover:bg-gray-100/80 smooth-animation btn-premium touch-target"
              data-hamburger
            >
              {isSidebarOpen ? (
                <X className="h-5 w-5 text-gray-700" />
              ) : (
                <Menu className="h-5 w-5 text-gray-700" />
              )}
            </Button>
          )}
          
          {/* Premium Profile Section */}
          <div className="flex items-center space-x-3">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center space-x-3 p-2 hover:bg-gray-100/80 transition-all duration-200 hover:scale-105 rounded-xl"
                >
                  <Avatar className="h-10 w-10 ring-2 ring-white/20">
                    <AvatarImage src={adminProfile?.profile_picture_url || undefined} alt={adminProfile?.full_name || 'Admin'} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold">
                      {adminProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block text-left">
                    <h2 className="text-sm font-semibold text-gray-900 tracking-tight">
                      {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                    </h2>
                    <p className="text-xs text-gray-500 font-medium">
                      {adminProfile?.job_title || 'Administrator'}
                    </p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-gray-500 hidden sm:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent 
                align="start" 
                className="w-64 bg-white/95 backdrop-blur-md border border-gray-200/60 shadow-xl rounded-xl"
              >
                <DropdownMenuLabel className="px-3 py-3">
                  <div className="flex items-center space-x-3">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={adminProfile?.profile_picture_url || undefined} alt={adminProfile?.full_name || 'Admin'} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 via-indigo-600 to-purple-600 text-white font-bold text-lg">
                        {adminProfile?.full_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'A'}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">
                        {adminProfile?.full_name || user?.email?.split('@')[0] || 'Admin'}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{adminProfile?.email || user?.email}</p>
                      {adminProfile?.job_title && (
                        <p className="text-xs text-gray-600 font-medium mt-1">{adminProfile.job_title}</p>
                      )}
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-gray-200/60" />
                <DropdownMenuItem 
                  onClick={() => router.push('/profile')}
                  className="px-3 py-2 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <User className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={() => router.push('/settings')}
                  className="px-3 py-2 hover:bg-gray-50/80 transition-colors cursor-pointer"
                >
                  <Settings className="h-4 w-4 mr-2 text-gray-600" />
                  <span className="text-sm">Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-gray-200/60" />
                <DropdownMenuItem 
                  onClick={handleSignOut}
                  disabled={isLoggingOut}
                  className="px-3 py-2 hover:bg-red-50/80 hover:text-red-700 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {isLoggingOut ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin text-red-600" />
                  ) : (
                    <LogOut className="h-4 w-4 mr-2 text-red-600" />
                  )}
                  <span className="text-sm font-medium">
                    {isLoggingOut ? 'Logging out...' : 'Logout'}
                  </span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {/* Enhanced Notification Bell */}
          <NotificationBell isMobile={isMobile} />
        </div>
      </div>
    </header>
  )
}


