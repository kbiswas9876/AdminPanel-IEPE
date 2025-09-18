'use client'

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { createEditorExtensions } from '@/lib/utils/editor-factory'
import { cn } from '@/lib/utils'
import { defaultImageUpload } from './ImageUploadHandler'
import 'katex/dist/katex.min.css'

interface PremiumMarkdownEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  autoFocus?: boolean
  onImageUpload?: (file: File) => Promise<string>
  theme?: 'light' | 'dark'
  compact?: boolean
  showToolbar?: boolean
  onSave?: (markdown: string, prosemirrorJson: object) => void
}

export function PremiumMarkdownEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  className,
  autoFocus = false,
  onImageUpload,
  theme = 'light',
  compact = false,
  showToolbar = false,
  onSave
}: PremiumMarkdownEditorProps) {
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [isDragOver, setIsDragOver] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const editorRef = useRef<HTMLDivElement>(null)

  const editor = useEditor({
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: cn(
          'prose dark:prose-invert max-w-none focus:outline-none p-4 min-h-[200px] overflow-y-auto',
          theme === 'dark' ? 'prose-dark' : 'prose-light',
          compact && 'text-sm p-3 min-h-[unset]'
        ),
      },
    },
    extensions: createEditorExtensions(placeholder),
    content: value,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      onChange(html)
      
      // Auto-save with dual format
      if (onSave) {
        const prosemirrorJson = editor.getJSON()
        // For now, just pass the HTML as markdown
        onSave(html, prosemirrorJson)
      }
    },
    autofocus: autoFocus,
  })

  // Handle image uploads
  const handleImageUpload = useCallback(async (file: File) => {
    if (!onImageUpload || !editor) return

    try {
      setIsLoading(true)
      const url = await onImageUpload(file)
      editor.chain().focus().setImage({ src: url }).run()
    } catch (error) {
      console.error('Image upload failed:', error)
    } finally {
      setIsLoading(false)
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
          if (onSave) {
            const prosemirrorJson = editor.getJSON()
            const html = editor.getHTML()
            onSave(html, prosemirrorJson)
          }
          break
      }
    }
  }, [editor, onSave])

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
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
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
            <button
              onClick={() => editor.chain().focus().toggleCode().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('code') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Code"
            >
              <code>&lt;/&gt;</code>
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

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Lists */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBulletList().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('bulletList') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Bullet List"
            >
              •
            </button>
            <button
              onClick={() => editor.chain().focus().toggleOrderedList().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('orderedList') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Numbered List"
            >
              1.
            </button>
            <button
              onClick={() => editor.chain().focus().toggleTaskList().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('taskList') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Task List"
            >
              ☐
            </button>
          </div>

          <div className="w-px h-6 bg-gray-300 mx-1" />

          {/* Other formatting */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => editor.chain().focus().toggleBlockquote().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                editor.isActive('blockquote') && 'bg-gray-200',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Quote"
            >
              &ldquo;
            </button>
            <button
              onClick={() => editor.chain().focus().setHorizontalRule().run()}
              className={cn(
                'p-2 rounded hover:bg-gray-200 transition-colors',
                theme === 'dark' && 'hover:bg-gray-700 text-white'
              )}
              title="Horizontal Rule"
            >
              —
            </button>
          </div>

          {onImageUpload && (
            <>
              <div className="w-px h-6 bg-gray-300 mx-1" />
              <button
                onClick={() => {
                  const input = document.createElement('input')
                  input.type = 'file'
                  input.accept = 'image/*'
                  input.onchange = (e) => {
                    const file = (e.target as HTMLInputElement).files?.[0]
                    if (file) {
                      handleImageUpload(file)
                    }
                  }
                  input.click()
                }}
                className={cn(
                  'p-2 rounded hover:bg-gray-200 transition-colors',
                  theme === 'dark' && 'hover:bg-gray-700 text-white'
                )}
                title="Upload Image"
              >
                🖼️
              </button>
            </>
          )}

          <div className="flex-1" />

          {/* Status indicators */}
          {isLoading && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Processing...
            </div>
          )}

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
