'use client'

import React, { useState, useCallback, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
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
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Minus
} from 'lucide-react'
import { LatexRenderer } from '@/lib/utils/latex-renderer'
import { cn } from '@/lib/utils'

interface LivePreviewEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  rows?: number
  showToolbar?: boolean
  compact?: boolean
  autoFocus?: boolean
  onImageUpload?: (file: File) => Promise<string>
}

// Enhanced markdown parser with proper rendering
const parseMarkdownToHTML = (text: string): string => {
  if (!text) return ''
  
  let html = text
    // Headers (must be processed first)
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4 text-gray-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-5 text-gray-800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6 text-gray-800">$1</h1>')
    
    // Code blocks (must be processed before inline code)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3 border border-gray-200"><code class="text-sm font-mono text-gray-800">$1</code></pre>')
    
    // Bold and italic (process bold first to avoid conflicts)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border border-gray-200">$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Lists (unordered)
    .replace(/^[\s]*[-*+] (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
    
    // Lists (ordered)
    .replace(/^[\s]*\d+\. (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-300 pl-4 py-2 my-2 bg-blue-50 text-gray-700 italic">$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-4 border-gray-300">')
    
    // Line breaks (convert double newlines to paragraphs)
    .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 leading-relaxed">')
    
    // Single line breaks
    .replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="mb-3 text-gray-700 leading-relaxed">${html}</p>`
  }
  
  return html
}

export function LivePreviewEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  rows = 4,
  showToolbar = true,
  compact = false,
  autoFocus = false,
  onImageUpload
}: LivePreviewEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const previewRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Sync scroll between textarea and preview
  const handleScroll = useCallback((e: React.UIEvent<HTMLTextAreaElement>) => {
    if (previewRef.current) {
      const scrollTop = e.currentTarget.scrollTop
      previewRef.current.scrollTop = scrollTop
    }
  }, [])

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
  const handleHeading1 = () => insertText('# ', '', 'Heading 1')
  const handleHeading2 = () => insertText('## ', '', 'Heading 2')
  const handleHeading3 = () => insertText('### ', '', 'Heading 3')
  const handleQuote = () => insertText('> ', '', 'quote text')
  const handleHorizontalRule = () => insertText('\n---\n', '', '')

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
    if (!value) {
      return (
        <div className="p-4 text-gray-400 italic">
          {placeholder}
        </div>
      )
    }
    
    const htmlContent = parseMarkdownToHTML(value)
    
    return (
      <div 
        ref={previewRef}
        className="p-4 text-gray-700 leading-relaxed overflow-y-auto"
        style={{ 
          minHeight: isFullscreen ? 'calc(100vh - 200px)' : `${rows * 1.5}rem`,
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}
      >
        <LatexRenderer text={htmlContent} />
      </div>
    )
  }

  const editorClasses = cn(
    "border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm",
    isDragOver && "border-blue-400 bg-blue-50 shadow-lg",
    isFullscreen && "fixed inset-4 z-50 shadow-2xl",
    className
  )

  const toolbarClasses = cn(
    "flex items-center gap-1 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100",
    compact && "p-2"
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
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleItalic}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCode}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Inline Code"
            >
              <Code className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLink}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
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
              onClick={handleHeading1}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Heading 1"
            >
              <Heading1 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHeading2}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Heading 2"
            >
              <Heading2 className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHeading3}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Heading 3"
            >
              <Heading3 className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="w-px h-6 bg-gray-300 mx-1" />
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleInlineMath}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Inline Math (Ctrl+Shift+M)"
            >
              <Type className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBlockMath}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
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
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleOrderedList}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleQuote}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Quote"
            >
              <Quote className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleHorizontalRule}
              className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
              title="Horizontal Rule"
            >
              <Minus className="h-4 w-4" />
            </Button>
          </div>
          
          {onImageUpload && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
                title="Upload Image"
              >
                <Image className="h-4 w-4" />
              </Button>
            </>
          )}
          
          <div className="flex-1" />
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="h-8 w-8 p-0 hover:bg-gray-200 transition-colors"
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
          </Button>
        </div>
      )}
      
      <div className="flex">
        {/* Editor Pane */}
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={isFullscreen ? 20 : rows}
            className="w-full h-full border-0 resize-none focus:ring-0 focus:outline-none font-mono text-sm p-4 leading-relaxed"
            style={{ 
              minHeight: isFullscreen ? 'calc(100vh - 200px)' : `${rows * 1.5}rem`,
              fontFamily: 'ui-monospace, SFMono-Regular, "SF Mono", Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
            }}
            onScroll={handleScroll}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onPaste={handlePaste}
            onKeyDown={handleKeyDown}
            autoFocus={autoFocus}
          />
        </div>
        
        {/* Live Preview Pane */}
        <div className="w-px bg-gray-200" />
        <div className="flex-1 bg-gray-50">
          {renderPreview()}
        </div>
      </div>
      
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
