'use client'

import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bold, 
  Italic, 
  Link, 
  Image, 
  Code, 
  List, 
  ListOrdered,
  Type,
  Eye,
  EyeOff,
  Maximize2,
  Minimize2,
} from 'lucide-react'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { cn } from '@/lib/utils'

interface MarkdownMathEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  showPreview?: boolean
  showToolbar?: boolean
  compact?: boolean
  autoFocus?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

// Simple markdown parser for basic formatting (currently unused but kept for future use)
const parseMarkdown = (text: string): string => {
  if (!text) return ''
  
  const html = text
    // Headers
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4">$1</h1>')
    // Bold
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>')
    // Italic
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-3 rounded-lg overflow-x-auto my-2"><code class="text-sm">$1</code></pre>')
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono">$1</code>')
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // Lists
    .replace(/^\* (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="ml-4">$1</li>')
    .replace(/^(\d+)\. (.*$)/gim, '<li class="ml-4">$2</li>')
    // Line breaks
    .replace(/\n/g, '<br>')
  
  return html
}

export function MarkdownMathEditor({
  value,
  onChange,
  placeholder = "Enter your content...",
  className,
  rows = 4,
  showPreview = true,
  showToolbar = true,
  compact = false,
  autoFocus = false,
  onImageUpload
}: MarkdownMathEditorProps) {
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Debounced rendering
  const [debouncedValue, setDebouncedValue] = useState(value)
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value)
    }, 200)
    return () => clearTimeout(timer)
  }, [value])

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
  const handleCode = () => insertText('`', '`', 'code')
  const handleLink = () => insertText('[', '](url)', 'link text')
  const handleInlineMath = () => insertText('$', '$', 'x^2 + y^2 = z^2')
  const handleBlockMath = () => insertText('$$\n', '\n$$', '\\int_0^\\infty e^{-x} dx = 1')
  const handleList = () => insertText('- ', '', 'list item')
  const handleOrderedList = () => insertText('1. ', '', 'ordered item')

  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload) return
    
    try {
      const url = await onImageUpload(file)
      insertText('![', `](${url})`, 'image description')
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }, [onImageUpload, insertText])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      handleImageUpload(file)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (imageItem && onImageUpload) {
      const file = imageItem.getAsFile()
      if (file) {
        e.preventDefault()
        handleImageUpload(file)
      }
    }
  }

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
        case 'k':
          e.preventDefault()
          handleLink()
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
    if (!debouncedValue) return null
    
    return (
      <div className="prose prose-sm max-w-none p-4 bg-white rounded-lg border border-gray-200 overflow-y-auto">
        <LatexRenderer text={debouncedValue} />
      </div>
    )
  }

  const editorClasses = cn(
    "border border-gray-200 rounded-lg overflow-hidden bg-white",
    isDragOver && "border-blue-400 bg-blue-50",
    isFullscreen && "fixed inset-4 z-50",
    className
  )

  const toolbarClasses = cn(
    "flex items-center gap-1 p-2 border-b border-gray-200 bg-gray-50",
    compact && "p-1"
  )

  return (
    <div className={editorClasses}>
      {showToolbar && (
        <div className={toolbarClasses}>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBold}
              className="h-8 w-8 p-0"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleItalic}
              className="h-8 w-8 p-0"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCode}
              className="h-8 w-8 p-0"
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLink}
              className="h-8 w-8 p-0"
              title="Link (Ctrl+K)"
            >
              <Link className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInlineMath}
              className="h-8 w-8 p-0"
              title="Inline Math (Ctrl+Shift+M)"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBlockMath}
              className="h-8 w-8 p-0"
              title="Block Math"
            >
              <Type className="h-4 w-4 font-bold" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleList}
              className="h-8 w-8 p-0"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOrderedList}
              className="h-8 w-8 p-0"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
          </div>
          
          {onImageUpload && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
                title="Upload Image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="flex-1" />
          
          <div className="flex items-center gap-1">
            {showPreview && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className="h-8 w-8 p-0"
                title={isPreviewMode ? "Show Editor" : "Show Preview"}
              >
                {isPreviewMode ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="h-8 w-8 p-0"
              title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </div>
        </div>
      )}
      
      <div className="flex">
        {!isPreviewMode && (
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              rows={isFullscreen ? 20 : rows}
              className="border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onPaste={handlePaste}
              onKeyDown={handleKeyDown}
              autoFocus={autoFocus}
            />
          </div>
        )}
        
        {showPreview && isPreviewMode && (
          <div className="flex-1">
            {renderPreview()}
          </div>
        )}
        
        {showPreview && !isPreviewMode && !compact && (
          <div className="w-px bg-gray-200" />
        )}
        
        {showPreview && !isPreviewMode && !compact && (
          <div className="flex-1">
            {renderPreview()}
          </div>
        )}
      </div>
      
      {compact && showPreview && !isPreviewMode && (
        <div className="border-t border-gray-200">
          {renderPreview()}
        </div>
      )}
      
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileSelect}
        className="hidden"
      />
    </div>
  )
}
