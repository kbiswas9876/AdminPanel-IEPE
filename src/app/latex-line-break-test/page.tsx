'use client'

import { useState } from 'react'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { EnhancedHTMLRenderer } from '@/components/editors/EnhancedHTMLRenderer'

export default function LatexLineBreakTestPage() {
  const [content, setContent] = useState(`
    <h1>LaTeX Line Break Test Page</h1>
    <p>This page tests the fixes for LaTeX line break handling in the TipTap editor.</p>
    
    <h2>Test 1: Shift+Enter for Regular Line Breaks</h2>
    <p>Use Shift+Enter to create line breaks in regular text:</p>
    <p>This is the first line<br>This is the second line<br>This is the third line</p>
    
    <h2>Test 2: LaTeX \\\\ Command in Math Context</h2>
    <p>Test LaTeX line breaks in math environments:</p>
    <p>Matrix with line breaks:</p>
    <p>$$\\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$$</p>
    
    <p>Aligned equations:</p>
    <p>$$\\begin{align} x + y &= 5 \\\\ x - y &= 1 \\end{align}$$</p>
    
    <h2>Test 3: Inline Math</h2>
    <p>Test inline math: $\\alpha + \\beta = \\gamma$</p>
    
    <h2>Test 4: Mixed Content</h2>
    <p>This paragraph has regular text with inline math $x^2 + y^2 = z^2$ and should not be affected by LaTeX line break processing.</p>
    
    <h2>Test 5: LaTeX Line Breaks with Custom Spacing</h2>
    <p>Test custom spacing in math:</p>
    <p>$$\\begin{align} a &= b \\\\[4pt] c &= d \\\\[6pt] e &= f \\end{align}$$</p>
    
    <h2>Test Instructions:</h2>
    <ol>
      <li><strong>Shift+Enter Test:</strong> Click in the editor and use Shift+Enter to create line breaks</li>
      <li><strong>LaTeX \\\\ Test:</strong> Type \\\\ in math environments (between $...$ or $$...$$) to create line breaks</li>
      <li><strong>Regular Text Test:</strong> Type \\\\ in regular text - it should NOT create line breaks</li>
      <li><strong>Math Context Test:</strong> Create matrices and aligned equations using \\\\</li>
    </ol>
  `)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">LaTeX Line Break Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Editor with LaTeX Line Break Fixes:</h2>
        <div className="border rounded-lg p-4 bg-white">
          <ClientOnlyAdvancedTipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Test LaTeX line breaks here... Use Shift+Enter for regular line breaks, \\\\ in math contexts for LaTeX line breaks"
            className="min-h-[400px]"
            showToolbar={true}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Expected Behavior:</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Fixed Issues:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Shift+Enter:</strong> Should create line breaks in regular text</li>
            <li><strong>LaTeX \\\\ in Math:</strong> Should work correctly in $...$ and $$...$$ contexts</li>
            <li><strong>No Sanitization Interference:</strong> Live editor content should not be processed by sanitization functions</li>
            <li><strong>Math Extensions:</strong> MathInline and MathBlock should not apply sanitization to live content</li>
            <li><strong>EnhancedHTMLRenderer:</strong> Should only process \\\\ in math contexts, not regular text</li>
          </ul>
          
          <h3 className="font-semibold mb-2 mt-4">🧪 Test Cases:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Regular Text:</strong> Type &quot;line1\\line2&quot; in regular text - should NOT create line break</li>
            <li><strong>Shift+Enter:</strong> Type &quot;line1&quot; then Shift+Enter then &quot;line2&quot; - should create line break</li>
            <li><strong>Inline Math:</strong> Type &quot;$x + y = 5 \\\\ z = 3$&quot; - should create line break in math</li>
            <li><strong>Display Math:</strong> Type matrix with line breaks - should work correctly</li>
            <li><strong>Mixed Content:</strong> Combine regular text with math - only math should process \\\\</li>
          </ol>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Rendered Output:</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          <EnhancedHTMLRenderer content={content} />
        </div>
      </div>
    </div>
  )
}
