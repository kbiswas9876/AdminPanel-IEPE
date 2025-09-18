# Advanced WYSIWYG Markdown Editor

## Overview

This is a premium, high-performance WYSIWYG Markdown editor built with TipTap, designed specifically for mathematical content creation. It provides an Obsidian-like editing experience with first-class LaTeX support, real-time rendering, and zero-lag performance.

## Features

### ✨ Core Features

- **WYSIWYG Editing**: Type Markdown syntax and see it rendered instantly
- **LaTeX Math Support**: Inline (`$...$`) and block (`$$...$$`) math rendering with KaTeX
- **Real-time Rendering**: Zero-lag conversion from Markdown to formatted content
- **Premium UI**: Clean, professional interface with light/dark theme support
- **Dual-format Storage**: Saves both Markdown (canonical) and ProseMirror JSON (for exact editor state)

### 🚀 Advanced Features

- **Web Worker Processing**: Heavy parsing and KaTeX rendering offloaded to background threads
- **Input Rules**: Obsidian-like auto-conversion of Markdown syntax
- **Code Block Editing**: CodeMirror 6 integration for syntax-highlighted code editing
- **Table Support**: Live table editing with Markdown conversion
- **Image Handling**: Drag & drop, paste, and upload support
- **Keyboard Shortcuts**: Full keyboard navigation and formatting
- **Accessibility**: Screen reader support and keyboard-only navigation

### 📝 Markdown Support

- **Headings**: All 6 levels (`# H1` through `###### H6`)
- **Text Formatting**: Bold (`**text**`), Italic (`*text*`), Strikethrough (`~~text~~`)
- **Lists**: Ordered (`1.`), unordered (`*` or `-`), and nested lists
- **Blockquotes**: `> Quoted text`
- **Code Blocks**: Fenced code blocks with syntax highlighting
- **Tables**: Full Markdown table support
- **Links**: `[text](url)` format
- **Math**: Inline (`$...$`) and block (`$$...$$`) LaTeX

## Installation

The editor is already integrated into the project. Dependencies are installed and ready to use.

### Dependencies

```json
{
  "@tiptap/react": "^3.4.4",
  "@tiptap/pm": "^3.4.4",
  "@tiptap/starter-kit": "^3.4.4",
  "@tiptap/extension-code-block-lowlight": "^3.4.4",
  "@tiptap/extension-table": "^3.4.4",
  "@codemirror/lang-javascript": "^6.0.0",
  "@codemirror/lang-python": "^6.0.0",
  "@codemirror/lang-html": "^6.0.0",
  "@codemirror/lang-css": "^6.0.0",
  "@codemirror/lang-json": "^6.0.0",
  "@codemirror/lang-markdown": "^6.0.0",
  "markdown-it": "^14.0.0",
  "katex": "^0.16.22",
  "react-katex": "^3.1.0"
}
```

## Usage

### Basic Usage

```tsx
import { PremiumMarkdownEditor } from '@/components/editors/PremiumMarkdownEditor'

function MyComponent() {
  const [content, setContent] = useState('')

  return (
    <PremiumMarkdownEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing..."
      theme="light"
      showToolbar={true}
      onImageUpload={handleImageUpload}
      onSave={handleSave}
    />
  )
}
```

### Advanced Usage

```tsx
import { PremiumMarkdownEditor } from '@/components/editors/PremiumMarkdownEditor'

function AdvancedEditor() {
  const [content, setContent] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleSave = (markdown: string, prosemirrorJson: any) => {
    // Save both formats to your database
    saveContent({
      markdown,
      prosemirrorJson,
      timestamp: new Date().toISOString()
    })
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Upload image and return URL
    const formData = new FormData()
    formData.append('image', file)
    
    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })
    
    const { url } = await response.json()
    return url
  }

  return (
    <PremiumMarkdownEditor
      value={content}
      onChange={setContent}
      placeholder="Start typing your content..."
      theme={theme}
      compact={false}
      showToolbar={true}
      autoFocus={false}
      onImageUpload={handleImageUpload}
      onSave={handleSave}
      className="min-h-[600px]"
    />
  )
}
```

## Components

### Core Components

- **`PremiumMarkdownEditor`**: Main editor component
- **`AdvancedWysiwygEditor`**: Alternative editor with different configuration
- **`MathInline`**: TipTap extension for inline math
- **`MathBlock`**: TipTap extension for block math
- **`MarkdownInputRules`**: Input rules for Obsidian-like behavior

### Utilities

- **`useMarkdownWorker`**: Hook for Web Worker communication
- **`editor-migration.ts`**: Migration utilities for legacy content
- **`markdown-parser.worker.ts`**: Web Worker for heavy processing

## API Reference

### PremiumMarkdownEditor Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | `string` | - | Current content (HTML) |
| `onChange` | `(value: string) => void` | - | Content change handler |
| `placeholder` | `string` | `"Start typing..."` | Placeholder text |
| `className` | `string` | - | Additional CSS classes |
| `autoFocus` | `boolean` | `false` | Auto-focus on mount |
| `onImageUpload` | `(file: File) => Promise<string>` | - | Image upload handler |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme variant |
| `compact` | `boolean` | `false` | Compact mode |
| `showToolbar` | `boolean` | `false` | Show toolbar |
| `onSave` | `(markdown: string, prosemirrorJson: any) => void` | - | Save handler |

### Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+B` | Toggle bold |
| `Ctrl+I` | Toggle italic |
| `Ctrl+U` | Toggle underline |
| `Ctrl+K` | Insert link |
| `Ctrl+Shift+M` | Insert inline math |
| `Ctrl+S` | Save content |
| `Tab` | Navigate table cells |
| `Shift+Tab` | Navigate table cells (reverse) |

### Input Rules

The editor automatically converts Markdown syntax to formatted content:

- `**text**` → **bold text**
- `*text*` → *italic text*
- `# Heading` → Heading 1
- `## Heading` → Heading 2
- `$math$` → Inline math
- `$$math$$` → Block math
- `- item` → Bullet list
- `1. item` → Numbered list
- `> quote` → Blockquote
- `---` → Horizontal rule

## Migration

### Migrating Legacy Content

```typescript
import { migrateLegacyContent, batchMigrateContent } from '@/lib/utils/editor-migration'

// Single content migration
const migratedContent = migrateLegacyContent([{
  id: 'content-1',
  content: 'Old content with **bold** and $math$',
  type: 'question'
}])

// Batch migration
const allMigratedContent = await batchMigrateContent(legacyContent, 100)
```

### Database Schema

```sql
CREATE TABLE content (
  id UUID PRIMARY KEY,
  content_markdown TEXT NOT NULL,
  content_prosemirror JSONB NOT NULL,
  preview_html TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Performance

### Optimization Strategies

1. **Web Worker Processing**: Heavy parsing and KaTeX rendering in background
2. **Incremental Rendering**: Only re-render changed nodes
3. **Caching**: KaTeX outputs cached by content hash
4. **Virtualization**: Large documents rendered efficiently
5. **Debouncing**: Heavy operations debounced to prevent lag

### Performance Metrics

- **Typing Latency**: < 20ms response time
- **Large Documents**: Handles 100KB+ documents smoothly
- **Math Rendering**: KaTeX cached for instant re-rendering
- **Memory Usage**: Efficient memory management with cleanup

## Theming

### Light Theme
```css
.editor-light {
  --editor-bg: #ffffff;
  --editor-text: #000000;
  --editor-border: #e5e7eb;
  --editor-math-bg: #f9fafb;
}
```

### Dark Theme
```css
.editor-dark {
  --editor-bg: #1f2937;
  --editor-text: #ffffff;
  --editor-border: #374151;
  --editor-math-bg: #111827;
}
```

## Accessibility

### Keyboard Navigation
- Full keyboard support for all operations
- Tab navigation for table cells
- Arrow key navigation for lists
- Escape key to exit editing modes

### Screen Reader Support
- Proper ARIA labels for all elements
- Math content described with LaTeX source
- Focus management for editor states
- Announcements for content changes

## Browser Support

- **Chrome**: 90+
- **Firefox**: 88+
- **Safari**: 14+
- **Edge**: 90+

## Troubleshooting

### Common Issues

1. **Math not rendering**: Check KaTeX CSS is loaded
2. **Worker not working**: Ensure Web Worker support
3. **Performance issues**: Check for memory leaks in large documents
4. **Image upload fails**: Verify upload handler returns valid URL

### Debug Mode

```typescript
// Enable debug logging
localStorage.setItem('editor-debug', 'true')

// Check worker status
console.log('Worker ready:', isReady)
console.log('Worker loading:', isLoading)
```

## Contributing

### Development Setup

1. Install dependencies: `npm install`
2. Start development server: `npm run dev`
3. Open editor demo: `http://localhost:3000/editor-demo`

### Adding New Features

1. Create TipTap extension in `src/components/editors/extensions/`
2. Add input rules in `MarkdownInputRules.tsx`
3. Update worker if needed in `markdown-parser.worker.ts`
4. Test with demo page

## License

This editor is part of the AdminPanel-IEPE project and follows the same license terms.

## Support

For issues and questions:
1. Check the troubleshooting section
2. Review the demo page for examples
3. Check browser console for errors
4. Verify all dependencies are installed correctly
