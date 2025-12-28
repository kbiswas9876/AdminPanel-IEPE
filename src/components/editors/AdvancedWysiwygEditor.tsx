'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '@/lib/utils/editor-factory'
import { cn } from '@/lib/utils'
import 'katex/dist/katex.min.css'

interface AdvancedWysiwygEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onImageUpload?: (file: File) => Promise<string>
  theme?: 'light' | 'dark'
  compact?: boolean
  showToolbar?: boolean
}

export function AdvancedWysiwygEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  autoFocus = false,
  onImageUpload,
  theme = 'light',
  compact = false,
  showToolbar = false
}: AdvancedWysiwygEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: createEditorExtensions(placeholder),
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none',
          theme === 'dark' ? 'prose-invert' : '',
          compact ? 'prose-sm' : ''
        ),
      },
    },
    autofocus: autoFocus,
  })

  // Handle image uploads
  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload || !editor) return

    try {
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('Image upload failed:', error)
    }
  }, [onImageUpload, editor])

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      handleImageUpload(imageFile)
    }
  }, [handleImageUpload])

  // Handle paste
  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const imageItem = items.find(item => item.type.startsWith('image/'))
    
    if (imageItem && onImageUpload) {
      const file = imageItem.getAsFile()
      if (file) {
        e.preventDefault()
        handleImageUpload(file)
      }
    }
  }, [handleImageUpload, onImageUpload])

  // Keyboard shortcuts
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (!editor) return

    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case 'b':
          e.preventDefault()
          editor.chain().focus().toggleBold().run()
          break
        case 'i':
          e.preventDefault()
          editor.chain().focus().toggleItalic().run()
          break
        case 'u':
          e.preventDefault()
          editor.chain().focus().toggleUnderline().run()
          break
        case 'k':
          e.preventDefault()
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
          break
        case 'm':
          if (e.shiftKey) {
            e.preventDefault()
            const math = window.prompt('Enter LaTeX math:')
            if (math) {
              editor.chain().focus().setMathInline({ math }).run()
            }
          }
          break
        case 's':
          e.preventDefault()
          // Save functionality can be added here
          break
      }
    }
  }, [editor])

  // Update content when value prop changes
  useEffect(() => {
    if (editor && value !== editor.getHTML()) {
      editor.commands.setContent(value)
    }
  }, [editor, value])

  // Cleanup editor on unmount
  useEffect(() => {
    return () => {
      if (editor) {
        editor.destroy()
      }
    }
  }, [editor])

  if (!editor) {
    return null
  }

  return (
    <div
      className={cn(
        'border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm',
        isDragOver && 'border-blue-400 bg-blue-50 shadow-lg',
        isFullscreen && 'fixed inset-4 z-50 shadow-2xl',
        theme === 'dark' && 'bg-gray-900 border-gray-700',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onPaste={handlePaste}
      onKeyDown={handleKeyDown}
    >
      {showToolbar && (
        <div className={cn(
          'flex items-center gap-1 p-3 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100',
          theme === 'dark' && 'bg-gray-800 border-gray-700',
          compact && 'p-2'
        )}>
          {/* Formatting buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('bold') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Bold (Ctrl+B)"
            >
              <strong>B</strong>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('italic') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Italic (Ctrl+I)"
            >
              <em>I</em>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('underline') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Underline (Ctrl+U)"
            >
              <u>U</u>
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Headings */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('heading', { level: 1 }) && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Heading 1"
            >
              H1
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('heading', { level: 2 }) && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Heading 2"
            >
              H2
            </button>
            <button
              onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('heading', { level: 3 }) && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Heading 3"
            >
              H3
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Math buttons */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const math = window.prompt('Enter LaTeX math:')
                if (math) {
                  editor.chain().focus().setMathInline({ math }).run()
                }
              }}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Inline Math (Ctrl+Shift+M)"
            >
              <span className="font-mono">$</span>
            </button>
            <button
              onClick={() => {
                const math = window.prompt('Enter LaTeX block math:')
                if (math) {
                  editor.chain().focus().setMathBlock({ math }).run()
                }
              }}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Block Math"
            >
              <span className="font-mono font-bold">$$</span>
            </button>
          </div>

          <div className="flex-1" />

          {/* Fullscreen toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className={cn(
              'p-2 rounded hover:bg-gray-200 transition-colors',
              theme === 'dark' && 'hover:bg-gray-700 text-white'
            )}
            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          >
            {isFullscreen ? '⤓' : '⤢'}
          </button>
        </div>
      )}

      <div className="relative">
        <EditorContent
          editor={editor}
          className={cn(
            'min-h-[200px] p-4 focus:outline-none',
            theme === 'dark' && 'bg-gray-900 text-white'
          )}
          ref={editorRef}
        />
      </div>
    </div>
  )
}
