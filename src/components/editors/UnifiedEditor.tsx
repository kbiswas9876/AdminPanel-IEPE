'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Image from '@tiptap/extension-image'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import TextAlign from '@tiptap/extension-text-align'
import Underline from '@tiptap/extension-underline'
import TaskList from '@tiptap/extension-task-list'
import TaskItem from '@tiptap/extension-task-item'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { createLowlight } from 'lowlight'
// import { MathExtension } from './extensions/MathExtension'
import { ImageUploadExtension } from './extensions/ImageUploadExtension'
import { ResizableImage } from 'tiptap-extension-resizable-image'
import { LineBreakExtension } from './extensions/LineBreakExtension'
import { LatexLineBreakExtension } from './extensions/LatexLineBreakExtension'
import { EditorToolbar } from './EditorToolbar'
import { cn } from '@/lib/utils'
import './editor-styles.css'
import 'tiptap-extension-resizable-image/styles.css'

interface UnifiedEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  showToolbar?: boolean
  compact?: boolean
  className?: string
  autoFocus?: boolean
}

export function UnifiedEditor({
  value,
  onChange,
  placeholder = "Start typing...",
  showToolbar = true,
  compact = false,
  className,
  autoFocus = false
}: UnifiedEditorProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = useCallback(async (file: File): Promise<string> => {
    setIsUploading(true)
    try {
      // Use Cloudinary upload API
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch('/api/cloudinary-upload', {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Upload failed')
      }
      
      const result = await response.json()
      return result.url
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }, [])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'editor-image rounded-lg shadow-sm max-w-full h-auto editor-image-align-left',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-600 underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Underline,
      TaskList,
      TaskItem.configure({
        nested: true,
      }),
      CodeBlockLowlight.configure({
        lowlight: createLowlight(),
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      // MathExtension,
      LineBreakExtension,
      LatexLineBreakExtension,
      ImageUploadExtension.configure({
        uploadHandler: handleImageUpload,
        maxFileSize: 5 * 1024 * 1024, // 5MB
        allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'],
      }),
    ],
    content: value,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg max-w-none focus:outline-none p-4 min-h-[200px]',
          compact && 'prose-sm p-3 min-h-[100px]'
        ),
      },
    },
    autofocus: autoFocus,
  })


  if (!editor) {
    return null
  }

  return (
    <div className={cn('unified-editor border rounded-lg bg-white', className)}>
      {showToolbar && (
        <EditorToolbar 
          editor={editor} 
          isUploading={isUploading}
        />
      )}
      <EditorContent 
        editor={editor} 
        className={cn(
          'editor-content',
          compact && 'min-h-[100px]'
        )}
      />
    </div>
  )
}
