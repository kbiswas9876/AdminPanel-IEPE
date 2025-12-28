'use client'

import { useEffect, useState } from 'react'
import { PremiumMarkdownEditor } from './PremiumMarkdownEditor'

interface ClientOnlyEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  theme?: 'light' | 'dark'
  compact?: boolean
  showToolbar?: boolean
  autoFocus?: boolean
  onImageUpload?: (file: File) => Promise<string>
  onSave?: (markdown: string, prosemirrorJson: object) => void
}

export function ClientOnlyEditor(props: ClientOnlyEditorProps) {
  const [isClient, setIsClient] = useState(false)
  const [editorKey] = useState(() => `client-editor-${Math.random().toString(36).substr(2, 9)}`)

  useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    // Return a placeholder during SSR
    return (
      <div className={props.className}>
        <div className="border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
          <div className="p-4 text-gray-500 text-center">
            Loading editor...
          </div>
        </div>
      </div>
    )
  }

  return <PremiumMarkdownEditor key={editorKey} {...props} />
}
