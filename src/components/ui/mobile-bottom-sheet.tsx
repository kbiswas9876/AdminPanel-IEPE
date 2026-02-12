'use client'

import React, { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ChevronUp, ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  className?: string
  showHandle?: boolean
  snapPoints?: number[]
  defaultSnap?: number
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  title,
  children,
  className,
  showHandle = true,
  snapPoints = [0.25, 0.5, 0.9],
  defaultSnap = 0.5
}: MobileBottomSheetProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [currentSnap, setCurrentSnap] = useState(defaultSnap)
  const [startY, setStartY] = useState(0)
  const [currentY, setCurrentY] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    setStartY(e.touches[0].clientY)
    setCurrentY(e.touches[0].clientY)
  }

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return
    
    const deltaY = e.touches[0].clientY - startY
    const newY = Math.max(0, Math.min(window.innerHeight, currentY + deltaY))
    setCurrentY(newY)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    
    setIsDragging(false)
    
    // Snap to nearest snap point
    const height = window.innerHeight
    const currentHeight = height - currentY
    const currentPercentage = currentHeight / height
    
    let nearestSnap = snapPoints[0]
    let minDistance = Math.abs(currentPercentage - snapPoints[0])
    
    for (const snap of snapPoints) {
      const distance = Math.abs(currentPercentage - snap)
      if (distance < minDistance) {
        minDistance = distance
        nearestSnap = snap
      }
    }
    
    setCurrentSnap(nearestSnap)
    
    // Close if dragged down significantly
    if (currentPercentage < 0.1) {
      onClose()
    }
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true)
    setStartY(e.clientY)
    setCurrentY(e.clientY)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return
    
    const deltaY = e.clientY - startY
    const newY = Math.max(0, Math.min(window.innerHeight, currentY + deltaY))
    setCurrentY(newY)
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.addEventListener('touchmove', handleTouchMove, { passive: false })
      document.addEventListener('touchend', handleTouchEnd)
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.removeEventListener('touchmove', handleTouchMove)
      document.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, startY, currentY])

  const getHeight = () => {
    if (isDragging) {
      return `${Math.max(25, Math.min(90, ((window.innerHeight - currentY) / window.innerHeight) * 100))}vh`
    }
    return `${currentSnap * 100}vh`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={cn(
          "fixed bottom-0 left-0 right-0 top-auto h-auto max-h-[90vh] p-0 rounded-t-lg",
          "data-[state=open]:animate-in data-[state=closed]:animate-out",
          "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
          className
        )}
        style={{ height: getHeight() }}
      >
        <div className="flex flex-col h-full">
          {/* Header with Handle */}
          <div 
            className="flex items-center justify-between p-4 border-b border-gray-200 bg-white rounded-t-lg"
            onTouchStart={handleTouchStart}
            onMouseDown={handleMouseDown}
          >
            <div className="flex items-center gap-2">
              {showHandle && (
                <div className="w-8 h-1 bg-gray-300 rounded-full mx-auto" />
              )}
              <h3 className="font-semibold text-gray-900">{title}</h3>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {children}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Mobile-specific components
export function MobileFilterSheet({ isOpen, onClose, children }: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Filters"
      snapPoints={[0.4, 0.7]}
      defaultSnap={0.4}
    >
      {children}
    </MobileBottomSheet>
  )
}

export function MobileBulkActionsSheet({ isOpen, onClose, children }: {
  isOpen: boolean
  onClose: () => void
  children: React.ReactNode
}) {
  return (
    <MobileBottomSheet
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Actions"
      snapPoints={[0.3, 0.6]}
      defaultSnap={0.3}
    >
      {children}
    </MobileBottomSheet>
  )
}
