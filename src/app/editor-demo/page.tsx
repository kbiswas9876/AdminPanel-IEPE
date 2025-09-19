'use client'

import React, { useState } from 'react'
import { ClientOnlyUnifiedEditor } from '@/components/editors/ClientOnlyUnifiedEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Upload, 
  Settings, 
  Eye, 
  Code, 
  Table,
  List,
  Type,
  FunctionSquare,
  Image as ImageIcon
} from 'lucide-react'

export default function EditorDemoPage() {
  const [content, setContent] = useState(`
    <h1>Unified Editor Demo</h1>
    <p>This is a <strong>premium</strong> editor with <em>real-time</em> rendering and LaTeX support.</p>
    
    <h2>Features</h2>
    <ul>
      <li><strong>WYSIWYG Editing</strong>: Type and see it rendered instantly</li>
      <li><strong>LaTeX Math Support</strong>: Inline math $E = mc^2$ and block math:</li>
    </ul>
    
    <p>Block math:</p>
    <span data-formula="\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}" data-display="true"></span>
    
    <h3>Code Blocks</h3>
    <pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
    
    <h3>Tables</h3>
    <table>
      <thead>
        <tr>
          <th>Feature</th>
          <th>Status</th>
          <th>Priority</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Math</td>
          <td>✅</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Images</td>
          <td>✅</td>
          <td>High</td>
        </tr>
        <tr>
          <td>Tables</td>
          <td>✅</td>
          <td>Medium</td>
        </tr>
      </tbody>
    </table>
    
    <h3>Lists</h3>
    <ul>
      <li>Bullet point 1</li>
      <li>Bullet point 2
        <ul>
          <li>Nested item</li>
          <li>Another nested item</li>
        </ul>
      </li>
    </ul>
    
    <ol>
      <li>Numbered item 1</li>
      <li>Numbered item 2</li>
      <li>Numbered item 3</li>
    </ol>
    
    <h3>Math Examples</h3>
    <p>Inline math: <span data-formula="\\alpha + \\beta = \\gamma"></span></p>
    
    <p>Block math:</p>
    <span data-formula="\\frac{\\partial f}{\\partial x} = \\lim_{h \\to 0} \\frac{f(x+h) - f(x)}{h}" data-display="true"></span>
    
    <h3>Links and Images</h3>
    <p><a href="https://example.com">Visit our website</a></p>
    
    <blockquote>
      <p>This is a blockquote with some important information.</p>
    </blockquote>
    
    <hr>
    
    <p><strong>End of demo content</strong></p>
  `)

  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [compact, setCompact] = useState(false)
  const [showToolbar, setShowToolbar] = useState(true)

  const exportHTML = () => {
    const blob = new Blob([content], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'content.html'
    a.click()
    URL.revokeObjectURL(url)
  }

  const importHTML = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.html,.htm'
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
            Unified Editor Demo
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            ProseMirror-based editor with LaTeX support, image uploads, and real-time rendering
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
                    <label htmlFor="theme">Dark Theme</label>
                    <input
                      type="checkbox"
                      id="theme"
                      checked={theme === 'dark'}
                      onChange={(e) => setTheme(e.target.checked ? 'dark' : 'light')}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="compact">Compact Mode</label>
                    <input
                      type="checkbox"
                      id="compact"
                      checked={compact}
                      onChange={(e) => setCompact(e.target.checked)}
                      className="rounded"
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <label htmlFor="toolbar">Show Toolbar</label>
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
                  <Button onClick={exportHTML} className="w-full" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export HTML
                  </Button>
                  
                  <Button onClick={importHTML} className="w-full" variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Import HTML
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
                    <FunctionSquare className="h-4 w-4 text-green-600" />
                    <span className="text-sm">LaTeX Math</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <ImageIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm">Image Upload</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Table className="h-4 w-4 text-purple-600" />
                    <span className="text-sm">Tables</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Code className="h-4 w-4 text-orange-600" />
                    <span className="text-sm">Code Blocks</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <List className="h-4 w-4 text-red-600" />
                    <span className="text-sm">Lists</span>
                    <Badge variant="secondary">✅</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-indigo-600" />
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
                <ClientOnlyUnifiedEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start typing your content..."
                  compact={compact}
                  showToolbar={showToolbar}
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