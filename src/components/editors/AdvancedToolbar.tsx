'use client'

import React, { useState } from 'react'
import { Editor } from '@tiptap/react'
import { Button } from '@/components/ui/button'
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  Quote,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Table,
  Image as ImageIcon,
  Link,
  Undo,
  Redo,
  Type,
  FunctionSquare,
  Palette,
  Minimize2,
  // Highlighter,
  Minus,
  Plus,
  Trash2,
  ChevronDown,
} from 'lucide-react'
import { MathSymbolPalette } from './MathSymbolPalette'
// import { CloudinaryUploadWidget } from './CloudinaryUploadWidget'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface AdvancedToolbarProps {
  editor: Editor
  isUploading?: boolean
  onImageUpload?: (file: File) => Promise<string>
  compact?: boolean
}

export function AdvancedToolbar({ 
  editor, 
  isUploading = false, 
  onImageUpload,
  compact = false 
}: AdvancedToolbarProps) {
  const [showMathPalette, setShowMathPalette] = useState(false)

  if (!editor) return null

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && onImageUpload) {
      try {
        const url = await onImageUpload(file)
        editor.chain().focus().setImage({ src: url }).run()
      } catch (error) {
        console.error('Image upload failed:', error)
      }
    }
    // Reset input
    event.target.value = ''
  }

  // const handleCloudinaryUpload = (url: string) => {
  //   editor.chain().focus().setImage({ src: url }).run()
  // }

  const insertMath = (formula: string) => {
    editor.chain().focus().insertContent(`$$${formula}$$`).run()
  }

  const insertTable = (rows: number, cols: number) => {
    editor.chain().focus().insertTable({ rows, cols, withHeaderRow: true }).run()
  }

  const setFontFamily = (fontFamily: string) => {
    editor.chain().focus().setFontFamily(fontFamily).run()
  }

  const setFontSize = (fontSize: string) => {
    editor.chain().focus().setFontSize(fontSize).run()
  }

  const getCurrentFontFamily = () => {
    const attributes = editor.getAttributes('textStyle')
    return attributes.fontFamily || ''
  }

  const getCurrentFontSize = () => {
    const attributes = editor.getAttributes('textStyle')
    return attributes.fontSize || ''
  }

  const fonts = [
    { name: 'Default', value: '' },
    { name: 'Arial', value: 'Arial, sans-serif' },
    { name: 'Helvetica', value: 'Helvetica, sans-serif' },
    { name: 'Times New Roman', value: 'Times New Roman, serif' },
    { name: 'Georgia', value: 'Georgia, serif' },
    { name: 'Cambria', value: 'Cambria, serif' },
    { name: 'Calibri', value: 'Calibri, sans-serif' },
    { name: 'Verdana', value: 'Verdana, sans-serif' },
    { name: 'Tahoma', value: 'Tahoma, sans-serif' },
    { name: 'Trebuchet MS', value: 'Trebuchet MS, sans-serif' },
    { name: 'Arial Black', value: 'Arial Black, sans-serif' },
    { name: 'Impact', value: 'Impact, sans-serif' },
    { name: 'Comic Sans MS', value: 'Comic Sans MS, cursive' },
    { name: 'Courier New', value: 'Courier New, monospace' },
    { name: 'Monaco', value: 'Monaco, monospace' },
    { name: 'Consolas', value: 'Consolas, monospace' },
    { name: 'Lucida Console', value: 'Lucida Console, monospace' },
    { name: 'Bookerly', value: 'Bookerly, serif' },
    { name: 'TeX Gyre Termes', value: 'TeX Gyre Termes, serif' },
    { name: 'TeX Gyre Pagella', value: 'TeX Gyre Pagella, serif' },
    { name: 'TeX Gyre Schola', value: 'TeX Gyre Schola, serif' },
    { name: 'TeX Gyre Bonum', value: 'TeX Gyre Bonum, serif' },
    { name: 'TeX Gyre Heros', value: 'TeX Gyre Heros, sans-serif' },
    { name: 'TeX Gyre Adventor', value: 'TeX Gyre Adventor, sans-serif' },
    { name: 'TeX Gyre Cursor', value: 'TeX Gyre Cursor, monospace' },
    { name: 'Palatino', value: 'Palatino, serif' },
    { name: 'Garamond', value: 'Garamond, serif' },
    { name: 'Baskerville', value: 'Baskerville, serif' },
    { name: 'Minion Pro', value: 'Minion Pro, serif' },
    { name: 'Myriad Pro', value: 'Myriad Pro, sans-serif' },
    { name: 'Futura', value: 'Futura, sans-serif' },
    { name: 'Gill Sans', value: 'Gill Sans, sans-serif' },
    { name: 'Optima', value: 'Optima, sans-serif' },
    { name: 'Franklin Gothic', value: 'Franklin Gothic, sans-serif' },
    { name: 'Century Gothic', value: 'Century Gothic, sans-serif' },
    { name: 'Avant Garde', value: 'Avant Garde, sans-serif' },
    { name: 'Helvetica Neue', value: 'Helvetica Neue, sans-serif' },
    { name: 'Roboto', value: 'Roboto, sans-serif' },
    { name: 'Open Sans', value: 'Open Sans, sans-serif' },
    { name: 'Lato', value: 'Lato, sans-serif' },
    { name: 'Source Sans Pro', value: 'Source Sans Pro, sans-serif' },
    { name: 'Montserrat', value: 'Montserrat, sans-serif' },
    { name: 'Poppins', value: 'Poppins, sans-serif' },
    { name: 'Inter', value: 'Inter, sans-serif' },
    { name: 'Nunito', value: 'Nunito, sans-serif' },
    { name: 'Playfair Display', value: 'Playfair Display, serif' },
    { name: 'Merriweather', value: 'Merriweather, serif' },
    { name: 'Crimson Text', value: 'Crimson Text, serif' },
    { name: 'Libre Baskerville', value: 'Libre Baskerville, serif' },
    { name: 'PT Serif', value: 'PT Serif, serif' },
    { name: 'Source Serif Pro', value: 'Source Serif Pro, serif' },
    { name: 'Fira Code', value: 'Fira Code, monospace' },
    { name: 'JetBrains Mono', value: 'JetBrains Mono, monospace' },
    { name: 'Cascadia Code', value: 'Cascadia Code, monospace' },
    { name: 'SF Mono', value: 'SF Mono, monospace' },
    { name: 'Menlo', value: 'Menlo, monospace' },
    { name: 'Inconsolata', value: 'Inconsolata, monospace' },
    { name: 'Ubuntu Mono', value: 'Ubuntu Mono, monospace' },
  ]

  const fontSizes = [
    { name: 'Default', value: '' },
    { name: '8px', value: '8px' },
    { name: '9px', value: '9px' },
    { name: '10px', value: '10px' },
    { name: '11px', value: '11px' },
    { name: '12px', value: '12px' },
    { name: '14px', value: '14px' },
    { name: '16px', value: '16px' },
    { name: '18px', value: '18px' },
    { name: '20px', value: '20px' },
    { name: '24px', value: '24px' },
    { name: '28px', value: '28px' },
    { name: '32px', value: '32px' },
    { name: '36px', value: '36px' },
    { name: '48px', value: '48px' },
    { name: '72px', value: '72px' },
  ]

  interface ToolbarItem {
    icon: React.ComponentType<{ className?: string }>
    onClick: () => void
    disabled?: boolean
    active?: boolean
    title: string
  }

  const toolbarSections: { title: string; items: ToolbarItem[] }[] = [
    // History
    {
      title: 'History',
      items: [
        {
          icon: Undo,
          onClick: () => editor.chain().focus().undo().run(),
          disabled: !editor.can().undo(),
          title: 'Undo',
        },
        {
          icon: Redo,
          onClick: () => editor.chain().focus().redo().run(),
          disabled: !editor.can().redo(),
          title: 'Redo',
        },
      ],
    },
    // Text Formatting
    {
      title: 'Text Formatting',
      items: [
        {
          icon: Bold,
          onClick: () => editor.chain().focus().toggleBold().run(),
          active: editor.isActive('bold'),
          title: 'Bold',
        },
        {
          icon: Italic,
          onClick: () => editor.chain().focus().toggleItalic().run(),
          active: editor.isActive('italic'),
          title: 'Italic',
        },
        {
          icon: Underline,
          onClick: () => editor.chain().focus().toggleUnderline().run(),
          active: editor.isActive('underline'),
          title: 'Underline',
        },
        {
          icon: Strikethrough,
          onClick: () => editor.chain().focus().toggleStrike().run(),
          active: editor.isActive('strike'),
          title: 'Strikethrough',
        },
        {
          icon: Code,
          onClick: () => editor.chain().focus().toggleCode().run(),
          active: editor.isActive('code'),
          title: 'Code',
        },
      ],
    },
    // Lists
    {
      title: 'Lists',
      items: [
        {
          icon: List,
          onClick: () => editor.chain().focus().toggleBulletList().run(),
          active: editor.isActive('bulletList'),
          title: 'Bullet List',
        },
        {
          icon: ListOrdered,
          onClick: () => editor.chain().focus().toggleOrderedList().run(),
          active: editor.isActive('orderedList'),
          title: 'Numbered List',
        },
        {
          icon: Quote,
          onClick: () => editor.chain().focus().toggleBlockquote().run(),
          active: editor.isActive('blockquote'),
          title: 'Blockquote',
        },
      ],
    },
    // Alignment
    {
      title: 'Alignment',
      items: [
        {
          icon: AlignLeft,
          onClick: () => editor.chain().focus().setTextAlign('left').run(),
          active: editor.isActive({ textAlign: 'left' }),
          title: 'Align Left',
        },
        {
          icon: AlignCenter,
          onClick: () => editor.chain().focus().setTextAlign('center').run(),
          active: editor.isActive({ textAlign: 'center' }),
          title: 'Align Center',
        },
        {
          icon: AlignRight,
          onClick: () => editor.chain().focus().setTextAlign('right').run(),
          active: editor.isActive({ textAlign: 'right' }),
          title: 'Align Right',
        },
        {
          icon: AlignJustify,
          onClick: () => editor.chain().focus().setTextAlign('justify').run(),
          active: editor.isActive({ textAlign: 'justify' }),
          title: 'Justify',
        },
      ],
    },
    // Math & Special
    {
      title: 'Math & Special',
      items: [
        {
          icon: FunctionSquare,
          onClick: () => insertMath('x^2 + y^2 = z^2'),
          title: 'Insert Math',
        },
        {
          icon: Palette,
          onClick: () => {
            // Create a simple color picker
            const colors = [
              '#000000', '#333333', '#666666', '#999999', '#cccccc', '#ffffff',
              '#ff0000', '#ff6600', '#ffcc00', '#00ff00', '#0066ff', '#6600ff',
              '#ff0066', '#ff3366', '#ff6699', '#66ff99', '#6699ff', '#9966ff'
            ]
            
            // Create overlay
            const overlay = document.createElement('div')
            overlay.className = 'color-picker-overlay'
            overlay.onclick = () => {
              document.body.removeChild(overlay)
            }
            
            const colorGrid = document.createElement('div')
            colorGrid.className = 'color-picker'
            colorGrid.onclick = (e) => e.stopPropagation()
            
            colors.forEach(color => {
              const colorButton = document.createElement('button')
              colorButton.className = 'color-button'
              colorButton.style.backgroundColor = color
              colorButton.onclick = () => {
                editor.chain().focus().setColor(color).run()
                document.body.removeChild(overlay)
              }
              colorGrid.appendChild(colorButton)
            })
            
            // Add remove color button
            const removeColorButton = document.createElement('button')
            removeColorButton.textContent = 'Remove Color'
            removeColorButton.onclick = () => {
              editor.chain().focus().unsetColor().run()
              document.body.removeChild(overlay)
            }
            colorGrid.appendChild(removeColorButton)
            
            // Add close button
            const closeButton = document.createElement('button')
            closeButton.textContent = 'Close'
            closeButton.onclick = () => {
              document.body.removeChild(overlay)
            }
            colorGrid.appendChild(closeButton)
            
            overlay.appendChild(colorGrid)
            document.body.appendChild(overlay)
          },
          title: 'Text Color',
        },
      ],
    },
    // Font Selection
    {
      title: 'Font Selection',
      items: [
        {
          icon: Type,
          onClick: () => {}, // This will be handled by the dropdown
          title: 'Font Family',
        },
        // Highlight temporarily disabled - extension needs proper configuration
        // {
        //   icon: Highlighter,
        //   onClick: () => editor.chain().focus().toggleHighlight().run(),
        //   active: editor.isActive('highlight'),
        //   title: 'Highlight',
        // },
      ],
    },
    // Tables
    {
      title: 'Tables',
      items: [
        {
          icon: Table,
          onClick: () => insertTable(3, 3),
          title: 'Insert Table',
        },
        {
          icon: Plus,
          onClick: () => editor.chain().focus().addRowAfter().run(),
          disabled: !editor.can().addRowAfter(),
          title: 'Add Row',
        },
        {
          icon: Minus,
          onClick: () => editor.chain().focus().deleteRow().run(),
          disabled: !editor.can().deleteRow(),
          title: 'Delete Row',
        },
        {
          icon: Trash2,
          onClick: () => editor.chain().focus().deleteTable().run(),
          disabled: !editor.can().deleteTable(),
          title: 'Delete Table',
        },
      ],
    },
    // Media
    {
      title: 'Media',
      items: [
        {
          icon: ImageIcon,
          onClick: () => document.getElementById('image-upload')?.click(),
          title: 'Upload Image (File)',
        },
        {
          icon: Link,
          onClick: () => {
            const url = window.prompt('Enter URL:')
            if (url) {
              editor.chain().focus().setLink({ href: url }).run()
            }
          },
          active: editor.isActive('link'),
          title: 'Add Link',
        },
      ],
    },
  ]

  if (compact) {
    // Simplified toolbar for compact mode
    const compactItems = [
      { icon: Bold, onClick: () => editor.chain().focus().toggleBold().run(), active: editor.isActive('bold') },
      { icon: Italic, onClick: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive('italic') },
      { icon: List, onClick: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive('bulletList') },
      { icon: FunctionSquare, onClick: () => insertMath('x^2'), title: 'Math' },
    ]

    return (
      <div className="editor-toolbar border-b p-2 flex items-center gap-1 flex-wrap">
        {compactItems.map((item, index) => (
          <Button
            key={index}
            variant="ghost"
            size="sm"
            onClick={item.onClick}
            className={item.active ? 'is-active' : ''}
            title={item.title}
          >
            <item.icon className="h-4 w-4" />
          </Button>
        ))}
        
        {/* Hidden file input for image upload */}
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
          disabled={isUploading}
        />
      </div>
    )
  }

  return (
    <div className="editor-toolbar border-b p-2 flex items-center gap-1 flex-wrap">
      {toolbarSections.map((section, sectionIndex) => (
        <React.Fragment key={sectionIndex}>
          {section.items.map((item, itemIndex) => (
            <Button
              key={`${sectionIndex}-${itemIndex}`}
              variant="ghost"
              size="sm"
              onClick={item.onClick}
              disabled={item.disabled || false}
              className={item.active ? 'is-active' : ''}
              title={item.title}
            >
              <item.icon className="h-4 w-4" />
            </Button>
          ))}
          {sectionIndex < toolbarSections.length - 1 && (
            <div className="w-px h-6 bg-gray-300 mx-1" />
          )}
        </React.Fragment>
      ))}

      {/* Font Selection Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Font Family">
            <Type className="h-4 w-4" />
            <span className="ml-1 text-xs">
              {getCurrentFontFamily() ? 
                fonts.find(f => f.value === getCurrentFontFamily())?.name || 'Custom' : 
                'Font'
              }
            </span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-60 overflow-y-auto w-64">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
            Font Family
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {fonts.map((font, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => setFontFamily(font.value)}
              className="cursor-pointer"
              style={{ fontFamily: font.value || 'inherit' }}
            >
              {font.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Font Size Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Font Size">
            <Minimize2 className="h-4 w-4" />
            <span className="ml-1 text-xs">
              {getCurrentFontSize() || 'Size'}
            </span>
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-60 overflow-y-auto w-32">
          <DropdownMenuLabel className="text-xs font-semibold text-gray-500">
            Font Size
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {fontSizes.map((size, index) => (
            <DropdownMenuItem
              key={index}
              onClick={() => setFontSize(size.value)}
              className="cursor-pointer"
              style={{ fontSize: size.value || 'inherit' }}
            >
              {size.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Math Symbol Palette */}
      <DropdownMenu open={showMathPalette} onOpenChange={setShowMathPalette}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" title="Math Symbols">
            <FunctionSquare className="h-4 w-4" />
            <ChevronDown className="h-3 w-3 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <MathSymbolPalette onInsert={insertMath} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Cloudinary Upload Widget - Temporarily disabled until preset is configured */}
      {/* <CloudinaryUploadWidget 
        onUpload={handleCloudinaryUpload}
        onError={(error) => console.error('Cloudinary upload error:', error)}
      /> */}

      {/* Hidden file input for image upload */}
      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="hidden"
        id="image-upload"
        disabled={isUploading}
      />
    </div>
  )
}
