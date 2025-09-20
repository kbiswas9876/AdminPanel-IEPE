'use client'

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
import { cn } from '@/lib/utils'
import { AdvancedToolbar } from './AdvancedToolbar'
import { useState } from 'react'

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
      // For now, create a temporary URL for the file
      // This will be replaced with proper Cloudinary upload once the preset is configured
      const tempUrl = URL.createObjectURL(file)
      
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Return a placeholder URL - in production this would be the Cloudinary URL
      return tempUrl
    } catch (error) {
      console.error('Image upload failed:', error)
      throw error
    } finally {
      setIsUploading(false)
    }
  }


  // Process content to handle LaTeX line breaks before passing to editor
  const processContent = (content: string) => {
    if (!content) return content
    
    // Process inline math $...$ to handle line breaks properly
    const processedContent = content.replace(/\$([^$]+)\$/g, (match, formula) => {
      // The formula already has proper LaTeX syntax with \\ for line breaks
      // We need to ensure KaTeX processes them correctly
      return `$${formula}$`
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
          class: 'editor-image rounded-lg shadow-sm max-w-full h-auto',
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
