import StarterKit from '@tiptap/starter-kit'
import { Document } from '@tiptap/extension-document'
import { Paragraph } from '@tiptap/extension-paragraph'
import { Text } from '@tiptap/extension-text'
import { Heading } from '@tiptap/extension-heading'
import { Bold } from '@tiptap/extension-bold'
import { Italic } from '@tiptap/extension-italic'
import { Code } from '@tiptap/extension-code'
import { BulletList } from '@tiptap/extension-bullet-list'
import { OrderedList } from '@tiptap/extension-ordered-list'
import { ListItem } from '@tiptap/extension-list-item'
import { Blockquote } from '@tiptap/extension-blockquote'
import { CodeBlock } from '@tiptap/extension-code-block'
import { HardBreak } from '@tiptap/extension-hard-break'
import { HorizontalRule } from '@tiptap/extension-horizontal-rule'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { Link } from '@tiptap/extension-link'
import { Image } from '@tiptap/extension-image'
import { Placeholder } from '@tiptap/extension-placeholder'
import { CharacterCount } from '@tiptap/extension-character-count'
import { TextStyle } from '@tiptap/extension-text-style'
import { Color } from '@tiptap/extension-color'
import { TextAlign } from '@tiptap/extension-text-align'
import { Underline } from '@tiptap/extension-underline'
import { Strike } from '@tiptap/extension-strike'
import { Superscript } from '@tiptap/extension-superscript'
import { Subscript } from '@tiptap/extension-subscript'
import { FontFamily } from '@tiptap/extension-font-family'
import { Highlight } from '@tiptap/extension-highlight'
import { TaskList } from '@tiptap/extension-task-list'
import { TaskItem } from '@tiptap/extension-task-item'
import { Mention } from '@tiptap/extension-mention'
import { Typography } from '@tiptap/extension-typography'
import { Gapcursor } from '@tiptap/extension-gapcursor'
import { Dropcursor } from '@tiptap/extension-dropcursor'
import { BubbleMenu } from '@tiptap/extension-bubble-menu'
import { FloatingMenu } from '@tiptap/extension-floating-menu'
import { MathInline } from '@/components/editors/extensions/MathInline'
import { MathBlock } from '@/components/editors/extensions/MathBlock'
import { MarkdownInputRules } from '@/components/editors/extensions/MarkdownInputRules'
import { CodeBlockLowlight } from '@tiptap/extension-code-block-lowlight'
import { common, createLowlight } from 'lowlight'

const _lowlight = createLowlight(common)

// Create a factory function that returns fresh plugin instances
export function createEditorExtensions(placeholder: string = 'Start typing...') {
  // Create completely fresh instances of each extension
  // Use individual extensions instead of StarterKit to avoid history conflicts
  const freshDocument = Document
  const freshParagraph = Paragraph
  const freshText = Text
  const freshHeading = Heading.configure({
    levels: [1, 2, 3, 4, 5, 6],
  })
  const freshBold = Bold
  const freshItalic = Italic
  const freshCode = Code
  const freshBulletList = BulletList.configure({
    keepMarks: true,
    keepAttributes: false,
  })
  const freshOrderedList = OrderedList.configure({
    keepMarks: true,
    keepAttributes: false,
  })
  const freshListItem = ListItem
  const freshBlockquote = Blockquote
  const freshCodeBlock = CodeBlock
  const freshHardBreak = HardBreak
  const freshHorizontalRule = HorizontalRule

  const freshTable = Table.configure({
    resizable: true,
  })

  const freshLink = Link.configure({
    openOnClick: false,
    autolink: true,
  })

  const freshImage = Image.configure({
    inline: true,
    allowBase64: true,
  })

  const freshCodeBlockLowlight = CodeBlockLowlight.configure({
    lowlight: _lowlight,
  })

  const freshPlaceholder = Placeholder.configure({
    placeholder,
  })

  // Remove separate History extension to prevent conflicts

  const freshTextAlign = TextAlign.configure({
    types: ['heading', 'paragraph'],
  })

  const freshHighlight = Highlight.configure({
    multicolor: true,
  })

  const freshTaskItem = TaskItem.configure({
    nested: true,
  })

  const freshMention = Mention.configure({
    HTMLAttributes: {
      class: 'mention',
    },
  })

  return [
    // Core document structure
    freshDocument,
    freshParagraph,
    freshText,
    freshHeading,
    
    // Text formatting
    freshBold,
    freshItalic,
    freshCode,
    
    // Lists
    freshBulletList,
    freshOrderedList,
    freshListItem,
    
    // Other blocks
    freshBlockquote,
    freshCodeBlockLowlight,
    freshHardBreak,
    freshHorizontalRule,
    
    // Tables
    freshTable,
    TableRow,
    TableHeader,
    TableCell,
    
    // Links and images
    freshLink,
    freshImage,
    
    // Placeholder
    freshPlaceholder,
    
    // Additional features
    CharacterCount,
    TextStyle,
    Color,
    freshTextAlign,
    Underline,
    Strike,
    Superscript,
    Subscript,
    FontFamily,
    freshHighlight,
    TaskList,
    freshTaskItem,
    freshMention,
    Typography,
    Gapcursor,
    Dropcursor,
    BubbleMenu,
    FloatingMenu,
    MathInline,
    MathBlock,
    MarkdownInputRules,
  ]
}
