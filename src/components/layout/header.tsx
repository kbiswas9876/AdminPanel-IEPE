'use client'

import { useAuth } from '@/lib/auth'
import { Button } from '@/components/ui/button'

export function Header() {
  const { user, signOut } = useAuth()

  const handleSignOut = async () => {
    await signOut()
  }

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-900">
            Welcome back, {user?.email}
          </h2>
        </div>
        <div className="flex items-center space-x-4">
          <Button
            onClick={handleSignOut}
            variant="outline"
            size="sm"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  )
}

