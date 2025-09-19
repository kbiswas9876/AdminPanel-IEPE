'use client'

import React from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import { 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Table,
  Image as ImageIcon,
  Link,
  Undo,
  Redo,
  Type,
  FunctionSquare
} from 'lucide-react'

interface EditorToolbarProps {
  editor: Editor
  isUploading?: boolean
}

export function EditorToolbar({ editor, isUploading = false }: EditorToolbarProps) {
  if (!editor) return null

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // For now, just insert a placeholder - image upload will be handled by drag/drop
      editor.chain().focus().insertContent(`<img src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlPC90ZXh0Pjwvc3ZnPg==" alt="Image placeholder" />`).run()
    }
    // Reset input
    event.target.value = ''
  }

  return (
    <div className="editor-toolbar border-b p-2 flex items-center gap-1 flex-wrap">
      {/* Undo/Redo */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().undo().run()}
        disabled={!editor.can().undo()}
      >
        <Undo className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().redo().run()}
        disabled={!editor.can().redo()}
      >
        <Redo className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Text Formatting */}
      <Button
        variant={editor.isActive('bold') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBold().run()}
      >
        <Bold className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('italic') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleItalic().run()}
      >
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('underline') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleUnderline().run()}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('strike') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleStrike().run()}
      >
        <Strikethrough className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('code') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleCode().run()}
      >
        <Code className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Headings */}
      <Button
        variant={editor.isActive('heading', { level: 1 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
      >
        <Heading1 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 2 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
      >
        <Heading2 className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('heading', { level: 3 }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
      >
        <Heading3 className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Lists */}
      <Button
        variant={editor.isActive('bulletList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('orderedList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive('taskList') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleTaskList().run()}
      >
        <Type className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Alignment */}
      <Button
        variant={editor.isActive({ textAlign: 'left' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('left').run()}
      >
        <AlignLeft className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'center' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('center').run()}
      >
        <AlignCenter className="h-4 w-4" />
      </Button>
      <Button
        variant={editor.isActive({ textAlign: 'right' }) ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().setTextAlign('right').run()}
      >
        <AlignRight className="h-4 w-4" />
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Line Break */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertContent('<br>').run()}
        title="Insert line break"
      >
        <span className="text-xs font-mono">↵</span>
      </Button>


      {/* Math */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertContent('$math$').run()}
        title="Insert inline math"
      >
        <FunctionSquare className="h-4 w-4" />
        <span className="ml-1 text-xs">$</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => editor.chain().focus().insertContent('$$math$$').run()}
        title="Insert block math"
      >
        <FunctionSquare className="h-4 w-4" />
        <span className="ml-1 text-xs">$$</span>
      </Button>

      <div className="w-px h-6 bg-gray-300 mx-1" />

      {/* Media */}
      <div className="relative">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          disabled={isUploading}
        />
        <Button
          variant="ghost"
          size="sm"
          disabled={isUploading}
          title="Upload image"
        >
          <ImageIcon className="h-4 w-4" />
          {isUploading && <span className="ml-1 text-xs">Uploading...</span>}
        </Button>
      </div>

      <Button
        variant={editor.isActive('link') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => {
          const url = window.prompt('Enter URL:')
          if (url) {
            editor.chain().focus().setLink({ href: url }).run()
          }
        }}
      >
        <Link className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('blockquote') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        <Quote className="h-4 w-4" />
      </Button>

      <Button
        variant={editor.isActive('table') ? 'default' : 'ghost'}
        size="sm"
        onClick={() => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run()}
      >
        <Table className="h-4 w-4" />
      </Button>
    </div>
  )
}
