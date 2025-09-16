'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, 
  Italic, 
  Type,
  Eye,
  EyeOff
} from 'lucide-react'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { cn } from '@/lib/utils'

interface CompactMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  showPreview?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

export function CompactMarkdownEditor({
  value,
  onChange,
  placeholder = "Enter content...",
  className,
  rows = 3,
  showPreview = true,
  onImageUpload
}: CompactMarkdownEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const insertText = useCallback((before: string, after: string = '', placeholder: string = '') => {
    const textarea = textareaRef.current
    if (!textarea) return

    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const selectedText = value.substring(start, end)
    const textToInsert = selectedText || placeholder
    
    const newValue = value.substring(0, start) + before + textToInsert + after + value.substring(end)
    onChange(newValue)
    
    // Restore cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length
      textarea.setSelectionRange(newCursorPos, newCursorPos)
      textarea.focus()
    }, 0)
  }, [value, onChange])

  const handleBold = () => insertText('**', '**', 'bold text')
  const handleItalic = () => insertText('*', '*', 'italic text')
  const handleInlineMath = () => insertText('$', '$', 'x^2 + y^2 = z^2')

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          handleBold()
          break
        case 'i':
          e.preventDefault()
          handleItalic()
          break
        case 'm':
          if (e.shiftKey) {
            e.preventDefault()
            handleInlineMath()
          }
          break
      }
    }
  }

  const renderPreview = () => {
    if (!value) return null
    
    return (
      <div className="prose prose-sm max-w-none p-3 bg-gray-50 rounded-lg border border-gray-200">
        <LatexRenderer text={value} />
      </div>
    )
  }

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white", className)}>
      {/* Compact Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            className="h-6 w-6 p-0"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className="h-6 w-6 p-0"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInlineMath}
            className="h-6 w-6 p-0"
            title="Math (Ctrl+Shift+M)"
          >
            <Type className="h-3 w-3" />
          </Button>
        </div>
        
        {showPreview && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsPreviewMode(!isPreviewMode)}
            className="h-6 w-6 p-0"
            title={isPreviewMode ? "Show Editor" : "Show Preview"}
          >
            {isPreviewMode ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
          </Button>
        )}
      </div>
      
      {!isPreviewMode ? (
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={rows}
          className="border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm"
          onKeyDown={handleKeyDown}
        />
      ) : (
        renderPreview()
      )}
      
      {showPreview && !isPreviewMode && (
        <div className="border-t border-gray-200">
          {renderPreview()}
        </div>
      )}
    </div>
  )
}
