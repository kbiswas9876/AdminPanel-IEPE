'use client'

import React, { useState } from 'react'
import { PremiumMarkdownEditor } from '@/components/editors/PremiumMarkdownEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { 
  Download, 
  Upload, 
  Settings, 
  Eye, 
  Code, 
  Table,
  List,
  Type
} from 'lucide-react'

export default function EditorDemoPage() {
  const [content, setContent] = useState(`
# Advanced WYSIWYG Markdown Editor

This is a **premium** markdown editor with *real-time* rendering and LaTeX support.

## Features

- **WYSIWYG Editing**: Type markdown and see it rendered instantly
- **LaTeX Math Support**: Inline math $E = mc^2$ and block math:

$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

- **Code Blocks**: 
\`\`\`javascript
function hello() {
  console.log("Hello, World!");
}
\`\`\`

- **Tables**:
| Feature | Status | Priority |
|---------|--------|----------|
| Math | ✅ | High |
| Tables | ✅ | High |
| Code | ✅ | Medium |

- **Lists**:
  - Bullet point 1
  - Bullet point 2
    - Nested item
    - Another nested item

1. Numbered item 1
2. Numbered item 2
3. Numbered item 3

- [ ] Task item 1
- [x] Completed task
- [ ] Task item 3

## Math Examples

Inline math: $\\alpha + \\beta = \\gamma$

Block math:
$$\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}$$

## Code Examples

\`\`\`python
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

\`\`\`html
<div class="container">
  <h1>Hello World</h1>
  <p>This is a paragraph.</p>
</div>
\`\`\`

## Links and Images

[Visit our website](https://example.com)

> This is a blockquote with some important information.

---

**End of demo content**
  `)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [compact, setCompact] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)

  const handleSave = (markdown: string, prosemirrorJson: object) => {
    console.log('Saving content:', { markdown, prosemirrorJson })
    // Here you would typically save to your database
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate image upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://via.placeholder.com/400x300?text=${file.name}`)
      }, 1000)
    })
  }

  const exportMarkdown = () => {
    const blob = new Blob([content], { type: 'text/markdown' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content.md'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importMarkdown = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.md,.markdown'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (file) {
        const reader = new FileReader()
        reader.onload = (e) => {
          setContent(e.target?.result as string)
        }
        reader.readAsText(file)
      }
    }
    input.click()
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Advanced WYSIWYG Markdown Editor
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Premium markdown editor with LaTeX support, real-time rendering, and Obsidian-like experience
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Settings Panel */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="theme">Dark Theme</Label>
                    <input
                      type="checkbox"
                      id="theme"
                      checked={theme === 'dark'}
                      onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="compact">Compact Mode</Label>
                    <input
                      type="checkbox"
                      id="compact"
                      checked={compact}
                      onChange={(e) => setCompact(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="toolbar">Show Toolbar</Label>
                    <input
                      type="checkbox"
                      id="toolbar"
                      checked={showToolbar}
                      onChange={(e) => setShowToolbar(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                </div>

                <div className="w-full h-px bg-gray-200 my-4"></div>

                <div className="space-y-2">
                  <Button onClick={exportMarkdown} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export Markdown
                  </Button>
                  
                  <Button onClick={importMarkdown} className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import Markdown
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Features</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-green-600" />
                    <span className="text-sm">LaTeX Math</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Tables</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Code Blocks</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Lists</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Typography</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="lg:col-span-3">
            <Tabs defaultValue="editor" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="editor">Editor</TabsTrigger>
                <TabsTrigger value="preview">Preview</TabsTrigger>
                <TabsTrigger value="source">Source</TabsTrigger>
              </TabsList>
              
              <TabsContent value="editor" className="mt-4">
                <PremiumMarkdownEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start typing your content..."
                  theme={theme}
                  compact={compact}
                  showToolbar={showToolbar}
                  onImageUpload={handleImageUpload}
                  onSave={handleSave}
                  className="min-h-[600px]"
                />
              </TabsContent>
              
              <TabsContent value="preview" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Eye className="h-5 w-5" />
                      Preview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div 
                      className="prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto"
                      dangerouslySetInnerHTML={{ __html: content }}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="source" className="mt-4">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Code className="h-5 w-5" />
                      Source Code
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto">
                      <code className="text-sm">{content}</code>
                    </pre>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  )
}
