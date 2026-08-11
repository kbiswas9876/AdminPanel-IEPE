'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'

interface NavigationTabsProps {
  userId: string
}

export function NavigationTabs({ userId }: NavigationTabsProps) {
  const pathname = usePathname()
  
  // Extract userId from the pathname as a fallback
  const actualUserId = userId || pathname?.split('/')[2] || ''
  const basePath = `/students/${actualUserId}`

  const tabs = [
    { href: basePath, label: 'Activity Timeline' },
    { href: `${basePath}/revision-hub`, label: 'Revision Hub Mirror' },
    { href: `${basePath}/practice-history`, label: 'Practice History' },
    { href: `${basePath}/mock-tests`, label: 'Mock Test History' }
  ]

  return (
    <div className="bg-white border-b border-gray-200">
      <nav className="px-6 flex space-x-8">
        {tabs.map((tab) => {
          const isActive = pathname === tab.href
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`relative py-4 text-sm font-medium transition-colors ${
                isActive
                  ? 'text-gray-900'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
              )}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

