'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { simpleTransitions } from '@/lib/utils/simple-transitions'

interface SmoothTabsProps {
  defaultValue?: string
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
  className?: string
}

interface SmoothTabsListProps {
  children: React.ReactNode
  className?: string
}

interface SmoothTabsTriggerProps {
  value: string
  children: React.ReactNode
  className?: string
}

interface SmoothTabsContentProps {
  value: string
  children: React.ReactNode
  className?: string
}

const SmoothTabsContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
}>({
  value: '',
  onValueChange: () => {}
})

export function SmoothTabs({ 
  defaultValue, 
  value, 
  onValueChange, 
  children, 
  className 
}: SmoothTabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue || '')
  const currentValue = value !== undefined ? value : internalValue
  
  const handleValueChange = React.useCallback((newValue: string) => {
    if (onValueChange) {
      onValueChange(newValue)
    } else {
      setInternalValue(newValue)
    }
  }, [onValueChange])

  return (
    <SmoothTabsContext.Provider value={{ value: currentValue, onValueChange: handleValueChange }}>
      <div className={cn('w-full', className)}>
        {children}
      </div>
    </SmoothTabsContext.Provider>
  )
}

export function SmoothTabsList({ children, className }: SmoothTabsListProps) {
  return (
    <div className={cn(
      'inline-flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground',
      className
    )}>
      {children}
    </div>
  )
}

export function SmoothTabsTrigger({ value, children, className }: SmoothTabsTriggerProps) {
  const { value: currentValue, onValueChange } = React.useContext(SmoothTabsContext)
  const isActive = currentValue === value

  return (
    <button
      onClick={() => onValueChange(value)}
      className={cn(
        'inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        isActive 
          ? 'bg-background text-foreground shadow-sm' 
          : 'hover:bg-background/50',
        className
      )}
    >
      {children}
    </button>
  )
}

export function SmoothTabsContent({ value, children, className }: SmoothTabsContentProps) {
  const { value: currentValue } = React.useContext(SmoothTabsContext)
  const isActive = currentValue === value

  if (!isActive) {
    return null
  }

  return (
    <div
      className={cn(
        'mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        simpleTransitions.getTabTransitionClasses(true),
        className
      )}
      style={simpleTransitions.getTabTransitionStyles(true)}
    >
      {children}
    </div>
  )
}
