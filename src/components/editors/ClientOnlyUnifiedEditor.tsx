'use client'

import React, { useState, useEffect } from 'react'
import { UnifiedEditor } from './UnifiedEditor'

interface ClientOnlyUnifiedEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showToolbar?: boolean
  compact?: boolean
  className?: string
  autoFocus?: boolean
}

export function ClientOnlyUnifiedEditor(props: ClientOnlyUnifiedEditorProps) {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a placeholder during SSR
    return (
      <div className={`unified-editor border rounded-lg bg-white ${props.className || ''}`}>
        {props.showToolbar && (
          <div className="editor-toolbar border-b p-2 flex items-center gap-1 flex-wrap">
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
          </div>
        )}
        <div className="p-4 min-h-[200px] bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Loading editor...</div>
        </div>
      </div>
    )
  }

  return <UnifiedEditor {...props} />
}
