'use client'

import React, { useState, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Type,
  Eye,
  EyeOff
} from 'lucide-react'
import { MarkdownLatexRenderer } from '@/lib/utils/markdown-latex-renderer'
import { cn } from '@/lib/utils'

interface CompactLivePreviewEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  onImageUpload?: (file: File, questionId?: number, fieldType?: string) => Promise<string>
}


export function CompactLivePreviewEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  rows = 3,
  onImageUpload
}: CompactLivePreviewEditorProps) {
  const [showPreview, setShowPreview] = useState(false)
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
    if (!value) {
      return (
        <div className="p-3 text-gray-400 italic text-sm">
          {placeholder}
        </div>
      )
    }
    
    return (
      <div className="p-3 text-gray-700 text-sm leading-relaxed">
        <MarkdownLatexRenderer text={value} />
      </div>
    )
  }

  return (
    <div className={cn("border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm", className)}>
      {/* Compact Toolbar */}
      <div className="flex items-center justify-between p-2 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBold}
            className="h-6 w-6 p-0 hover:bg-gray-200 transition-colors"
            title="Bold (Ctrl+B)"
          >
            <Bold className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleItalic}
            className="h-6 w-6 p-0 hover:bg-gray-200 transition-colors"
            title="Italic (Ctrl+I)"
          >
            <Italic className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleInlineMath}
            className="h-6 w-6 p-0 hover:bg-gray-200 transition-colors"
            title="Math (Ctrl+Shift+M)"
          >
            <Type className="h-3 w-3" />
          </Button>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowPreview(!showPreview)}
          className="h-6 w-6 p-0 hover:bg-gray-200 transition-colors"
          title={showPreview ? "Show Editor" : "Show Preview"}
        >
          {showPreview ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        </Button>
      </div>
      
      {!showPreview ? (
        <div className="flex">
          {/* Editor */}
          <div className="flex-1">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={rows}
              className="w-full border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm p-3 leading-relaxed"
              onKeyDown={handleKeyDown}
            />
          </div>
          
          {/* Live Preview */}
          <div className="w-px bg-gray-200" />
          <div className="flex-1 bg-gray-50">
            {renderPreview()}
          </div>
        </div>
      ) : (
        <div className="bg-gray-50">
          {renderPreview()}
        </div>
      )}
    </div>
  )
}

