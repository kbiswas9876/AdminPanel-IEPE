'use client'

import React, { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import { Mathematics } from '@tiptap/extension-mathematics'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Image } from '@tiptap/extension-image'
import { Link } from '@tiptap/extension-link'
import { TextAlign } from '@tiptap/extension-text-align'
import { Color } from '@tiptap/extension-color'
import { TextStyle } from '@tiptap/extension-text-style'
import { FontFamily } from '@tiptap/extension-font-family'
import { FontSize } from '@tiptap/extension-font-size'
import { Placeholder } from '@tiptap/extension-placeholder'
import { LatexLineBreakInputExtension } from './extensions/LatexLineBreakInputExtension'
import { ResizableImage } from 'tiptap-extension-resizable-image'
import { cn } from '@/lib/utils'
import { AdvancedToolbar } from './AdvancedToolbar'
import 'tiptap-extension-resizable-image/styles.css'

export interface AdvancedTipTapEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  compact?: boolean
  className?: string
  autoFocus?: boolean
  showToolbar?: boolean
}

export function AdvancedTipTapEditor({
  value,
  onChange,
  placeholder = 'Start typing...',
  compact = false,
  className,
  autoFocus = false,
  showToolbar = true,
}: AdvancedTipTapEditorProps) {
  const [isUploading, setIsUploading] = useState(false)

  const handleImageUpload = async (file: File): Promise<string> => {
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
  }


  // Process content to handle LaTeX commands and preserve backslashes
  const processContent = (content: string) => {
    if (!content) return content
    
    // CRITICAL FIX: When HTML containing LaTeX is parsed by the browser/Tiptap,
    // certain backslash sequences like \t (tab), \n (newline), \r (carriage return)
    // can be misinterpreted. We need to temporarily protect all LaTeX content
    // by HTML-entity encoding backslashes within math delimiters.
    
    let processedContent = content
    
    // First, protect backslashes in display math $$...$$ 
    processedContent = processedContent.replace(/\$\$([^$]+?)\$\$/g, (match, formula) => {
      // HTML-entity encode backslashes to prevent corruption during HTML parsing
      const protectedFormula = formula.replace(/\\/g, '&#92;')
      return `$$${protectedFormula}$$`
    })
    
    // Then, protect backslashes in inline math $...$
    processedContent = processedContent.replace(/\$([^$]+?)\$/g, (match, formula) => {
      // HTML-entity encode backslashes to prevent corruption during HTML parsing
      const protectedFormula = formula.replace(/\\/g, '&#92;')
      return `$${protectedFormula}$`
    })
    
    return processedContent
  }

  const editor = useEditor({
    immediatelyRender: false, // Fix SSR hydration mismatch
    parseOptions: {
      preserveWhitespace: 'full',
    },
    extensions: [
      StarterKit.configure({
        codeBlock: false, // We'll use CodeBlockLowlight instead
      }),
      Mathematics.configure({
        katexOptions: {
          throwOnError: false,
        },
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      Image.configure({
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
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      Color,
      TextStyle,
      FontFamily.configure({
        types: ['textStyle'],
      }),
      FontSize.configure({
        types: ['textStyle'],
      }),
      Placeholder.configure({
        placeholder,
      }),
      LatexLineBreakInputExtension,
      ResizableImage.configure({
        HTMLAttributes: {
          class: 'editor-image rounded-lg shadow-sm max-w-full h-auto editor-image-align-left',
        },
      }),
    ],
    content: processContent(value),
    onCreate: ({ editor }) => {
      // Set content with whitespace preservation
      editor.commands.setContent(processContent(value))
    },
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-lg max-w-none focus:outline-none min-h-[200px] p-4',
          compact && 'text-sm p-3 min-h-[unset]'
        ),
      },
    },
    autofocus: autoFocus,
  })

  // Update editor content when value prop changes (e.g., switching between questions)
  useEffect(() => {
    if (editor && value !== undefined) {
      const currentContent = editor.getHTML()
      const processedValue = processContent(value)
      
      // Only update if content has actually changed to avoid unnecessary re-renders
      if (currentContent !== processedValue) {
        editor.commands.setContent(processedValue)
      }
    }
  }, [editor, value])

  if (!editor) {
    return null
  }

  return (
    <div className={cn('editor-container', className)}>
      {showToolbar && (
        <AdvancedToolbar
          editor={editor}
          isUploading={isUploading}
          onImageUpload={handleImageUpload}
          compact={compact}
        />
      )}
      <EditorContent editor={editor} />
    </div>
  )
}
