'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Plus, ArrowRight, Save, Check } from 'lucide-react'

interface FloatingActionButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'primary' | 'secondary' | 'success'
  size?: 'sm' | 'md' | 'lg'
  icon?: React.ReactNode
  className?: string
  disabled?: boolean
  loading?: boolean
}

export function FloatingActionButton({
  onClick,
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className,
  disabled = false,
  loading = false
}: FloatingActionButtonProps) {
  const baseClasses = "fixed bottom-6 right-6 z-50 shadow-2xl transition-all duration-300 ease-out hover:scale-105 active:scale-95"
  
  const variantClasses = {
    primary: "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/25",
    secondary: "bg-white hover:bg-gray-50 text-gray-900 border border-gray-200 shadow-gray-500/10",
    success: "bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-green-500/25"
  }
  
  const sizeClasses = {
    sm: "h-12 px-4 text-sm",
    md: "h-14 px-6 text-base",
    lg: "h-16 px-8 text-lg"
  }

  const iconSize = {
    sm: "h-4 w-4",
    md: "h-5 w-5", 
    lg: "h-6 w-6"
  }

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        "rounded-full font-semibold flex items-center gap-3 backdrop-blur-sm",
        "hover:shadow-3xl transform-gpu",
        disabled && "opacity-50 cursor-not-allowed hover:scale-100",
        className
      )}
    >
      {loading ? (
        <div className="animate-spin rounded-full border-2 border-white/30 border-t-white h-4 w-4" />
      ) : (
        icon || <Plus className={iconSize[size]} />
      )}
      <span className="hidden sm:inline">{children}</span>
    </Button>
  )
}

// Specialized FAB components for common actions
export function CreateFAB({ onClick, disabled, loading }: { onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      variant="primary"
      icon={<Plus className="h-5 w-5" />}
      disabled={disabled}
      loading={loading}
    >
      Create New
    </FloatingActionButton>
  )
}

export function SaveFAB({ onClick, disabled, loading }: { onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      variant="success"
      icon={<Save className="h-5 w-5" />}
      disabled={disabled}
      loading={loading}
    >
      Save Changes
    </FloatingActionButton>
  )
}

export function NextFAB({ onClick, disabled, loading }: { onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      variant="primary"
      icon={<ArrowRight className="h-5 w-5" />}
      disabled={disabled}
      loading={loading}
    >
      Next: Review & Refine
    </FloatingActionButton>
  )
}

export function CompleteFAB({ onClick, disabled, loading }: { onClick: () => void; disabled?: boolean; loading?: boolean }) {
  return (
    <FloatingActionButton
      onClick={onClick}
      variant="success"
      icon={<Check className="h-5 w-5" />}
      disabled={disabled}
      loading={loading}
    >
      Complete
    </FloatingActionButton>
  )
}

