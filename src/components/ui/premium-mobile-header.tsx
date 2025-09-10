'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'

interface PremiumMobileHeaderProps {
  title: string
  subtitle?: string
  icon?: ReactNode
  actions?: ReactNode
  showBackButton?: boolean
  onBack?: () => void
  className?: string
}

export function PremiumMobileHeader({
  title,
  subtitle,
  icon,
  actions,
  showBackButton = false,
  onBack,
  className
}: PremiumMobileHeaderProps) {
  return (
    <div className={cn(
      "sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/50 shadow-sm",
      className
    )}>
      <div className="px-4 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center justify-between">
          {/* Left Section - Back Button, Title & Icon */}
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            {showBackButton && (
              <Button
                variant="outline"
                size="sm"
                onClick={onBack}
                className="flex-shrink-0 h-8 w-8 p-0 hover:bg-gray-50 transition-colors duration-200"
                title="Go back"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
            )}
            
            {icon && (
              <div className="flex-shrink-0 p-2 rounded-lg bg-gradient-to-br from-blue-100 to-indigo-100">
                {icon}
              </div>
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg sm:text-xl font-bold text-gray-900 tracking-tight truncate">
                {title}
              </h1>
              {subtitle && (
                <p className="text-xs sm:text-sm text-gray-600 font-medium truncate">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
          
          {/* Right Section - Actions */}
          {actions && (
            <div className="flex-shrink-0 ml-3">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
