import React from 'react'
import { cn } from '@/lib/utils'

interface ToggleSwitchProps {
  checked: boolean
  onCheckedChange: (checked: boolean) => void
  disabled?: boolean
  id?: string
  className?: string
}

export function ToggleSwitch({ 
  checked, 
  onCheckedChange, 
  disabled = false, 
  id,
  className 
}: ToggleSwitchProps) {
  return (
    <button
      type="button"
      id={id}
      disabled={disabled}
      onClick={() => onCheckedChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        checked ? "bg-blue-600" : "bg-gray-200",
        className
      )}
    >
      <span
        className={cn(
          "inline-block h-4 w-4 transform rounded-full bg-white transition-transform",
          checked ? "translate-x-6" : "translate-x-1"
        )}
      />
    </button>
  )
}
