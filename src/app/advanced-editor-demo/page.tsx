'use client'

import React, { useState } from 'react'
import { AdvancedTipTapEditor } from '@/components/editors/AdvancedTipTapEditor'
import { EnhancedHTMLRenderer } from '@/components/editors/EnhancedHTMLRenderer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { sanitizeForDatabase } from '@/lib/utils/sanitize'

export default function AdvancedEditorDemo() {
  const [content, setContent] = useState('')
  const [savedContent, setSavedContent] = useState('')

  const handleSave = () => {
    const sanitized = sanitizeForDatabase(content)
    setSavedContent(sanitized)
    console.log('Saved content:', sanitized)
  }

  const testCases = [
    {
      title: 'Basic LaTeX',
      content: 'This is inline math: $x^2 + y^2 = z^2$ and this is display math: $$\\frac{a}{b} = \\frac{c}{d}$$'
    },
    {
      title: 'LaTeX with Line Breaks',
      content: 'First line \\\\Second line with spacing \\\\[4pt]Third line with more spacing \\\\[6pt]Fourth line'
    },
    {
      title: 'Complex Math',
      content: '$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix} \\begin{pmatrix} x \\\\ y \\end{pmatrix} = \\begin{pmatrix} ax + by \\\\ cx + dy \\end{pmatrix}$$'
    },
    {
      title: 'Mixed Content',
      content: '<h2>Question</h2><p>Solve the equation: $x^2 - 5x + 6 = 0$</p><p>Show your work:</p><ol><li>Factor: $(x-2)(x-3) = 0$</li><li>Solutions: $x = 2$ or $x = 3$</li></ol>'
    }
  ]

  return (
    <div className="container mx-auto p-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">Advanced TipTap Editor Demo</h1>
        <p className="text-gray-600">Test the new editor with LaTeX, images, and rich text features</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Editor</CardTitle>
          </CardHeader>
          <CardContent>
            <AdvancedTipTapEditor
              value={content}
              onChange={setContent}
              placeholder="Start typing your content here..."
              className="min-h-[400px]"
            />
            <div className="mt-4 flex gap-2">
              <Button onClick={handleSave}>Save Content</Button>
              <Button variant="outline" onClick={() => setContent('')}>Clear</Button>
            </div>
          </CardContent>
        </Card>

        {/* Preview */}
        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="min-h-[400px] border rounded p-4">
              {savedContent ? (
                <EnhancedHTMLRenderer content={savedContent} />
              ) : (
                <p className="text-gray-500">No content saved yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Test Cases */}
      <Card>
        <CardHeader>
          <CardTitle>Test Cases</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {testCases.map((testCase, index) => (
              <div key={index} className="border rounded p-4">
                <h3 className="font-semibold mb-2">{testCase.title}</h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setContent(testCase.content)}
                >
                  Load Test Case
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Features Checklist */}
      <Card>
        <CardHeader>
          <CardTitle>Features Checklist</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">LaTeX Support</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Inline math: $...$</li>
                <li>✅ Display math: $$...$$</li>
                <li>✅ Line breaks: \\</li>
                <li>✅ Custom spacing: \\[4pt]</li>
                <li>✅ Math symbols palette</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Rich Text Features</h3>
              <ul className="space-y-1 text-sm">
                <li>✅ Bold, Italic, Underline</li>
                <li>✅ Headings (H1, H2, H3)</li>
                <li>✅ Lists (Bullet, Numbered)</li>
                <li>✅ Tables with controls</li>
                <li>✅ Text alignment</li>
                <li>✅ Links and images</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
