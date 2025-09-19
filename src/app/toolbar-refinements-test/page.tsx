'use client'

import { useState } from 'react'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { EnhancedHTMLRenderer } from '@/components/editors/EnhancedHTMLRenderer'

export default function ToolbarRefinementsTestPage() {
  const [content, setContent] = useState(`
    <h1>Toolbar Refinements Test Page</h1>
    <p>This page tests all the toolbar refinements and bug fixes implemented.</p>
    
    <h2>Test 1: Removed Heading Controls</h2>
    <p>✅ The toolbar should no longer have Paragraph, H1, H2, H3 controls.</p>
    <p>✅ Only essential formatting tools should remain.</p>
    
    <h2>Test 2: Blockquote Visual Styling</h2>
    <p>Use the Blockquote button in the toolbar to create a blockquote. It should have:</p>
    <ul>
      <li>Left border (gray)</li>
      <li>Indentation</li>
      <li>Muted text color</li>
      <li>Light background</li>
    </ul>
    <blockquote>
      This is a test blockquote. It should be visually distinct from regular text with a left border, indentation, and muted styling.
    </blockquote>
    
    <h2>Test 3: Font Family & Size Icons</h2>
    <p>✅ Font Family button should have a "T" icon (Type icon)</p>
    <p>✅ Font Size button should have a minimize icon (Minimize2 icon)</p>
    <p>✅ Both buttons should be visually distinct</p>
    
    <h2>Test 4: Font Family Active State</h2>
    <p>Select text and change font family. The dropdown should show the current font:</p>
    <p style="font-family: 'Times New Roman', serif;">This text is Times New Roman</p>
    <p style="font-family: 'Arial', sans-serif;">This text is Arial</p>
    <p style="font-family: 'Courier New', monospace;">This text is Courier New</p>
    
    <h2>Test 5: Font Size Active State</h2>
    <p>Select text and change font size. The dropdown should show the current size:</p>
    <p style="font-size: 12px;">This text is 12px</p>
    <p style="font-size: 16px;">This text is 16px</p>
    <p style="font-size: 24px;">This text is 24px</p>
    <p style="font-size: 32px;">This text is 32px</p>
    
    <h2>Test 6: Mixed Selection Handling</h2>
    <p>Select text with different fonts/sizes. The dropdowns should handle mixed selections gracefully.</p>
    <p><span style="font-family: 'Times New Roman', serif; font-size: 14px;">Times 14px</span> and <span style="font-family: 'Arial', sans-serif; font-size: 18px;">Arial 18px</span> in the same selection.</p>
    
    <h2>Test 7: Toolbar Active States</h2>
    <p>Select text and apply formatting. Buttons should show active state (blue background):</p>
    <p><strong>Bold text</strong>, <em>italic text</em>, <u>underlined text</u>, <s>strikethrough text</s></p>
    
    <h2>Test 8: Lists and Alignment</h2>
    <p>Test bullet and numbered lists:</p>
    <ul>
      <li>Bullet point 1</li>
      <li>Bullet point 2</li>
    </ul>
    <ol>
      <li>Numbered item 1</li>
      <li>Numbered item 2</li>
    </ol>
    
    <p>Test text alignment:</p>
    <p style="text-align: left;">Left aligned text</p>
    <p style="text-align: center;">Center aligned text</p>
    <p style="text-align: right;">Right aligned text</p>
    
    <h2>Test 9: Color and Math</h2>
    <p>Test color picker and math rendering:</p>
    <p style="color: red;">Red text</p>
    <p style="color: blue;">Blue text</p>
    <p>Math: $\\alpha + \\beta = \\gamma$</p>
    <p>Display math: $$\\sum_{i=0}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$$</p>
  `)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Toolbar Refinements Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Editor with All Refinements Applied:</h2>
        <div className="border rounded-lg p-4 bg-white">
          <ClientOnlyAdvancedTipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Test all the toolbar refinements here..."
            className="min-h-[400px]"
            showToolbar={true}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Checklist:</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="font-semibold mb-2">✅ Completed Refinements:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Removed Headings:</strong> No Paragraph, H1, H2, H3 controls in toolbar</li>
            <li><strong>Blockquote Styling:</strong> Blockquotes have left border, indentation, muted color</li>
            <li><strong>Distinct Icons:</strong> Font Family (T icon) and Font Size (minimize icon) are different</li>
            <li><strong>Active State Feedback:</strong> Both dropdowns show current selection</li>
            <li><strong>Mixed Selection Handling:</strong> Dropdowns handle multiple fonts/sizes gracefully</li>
            <li><strong>Toolbar States:</strong> Formatting buttons show active state (blue background)</li>
          </ul>
          
          <h3 className="font-semibold mb-2 mt-4">🧪 Test Instructions:</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li><strong>Check Toolbar:</strong> Verify no heading controls (H1, H2, H3, Paragraph)</li>
            <li><strong>Test Blockquotes:</strong> Use Blockquote button - should have left border and indentation</li>
            <li><strong>Test Icons:</strong> Font Family and Font Size buttons should have different icons</li>
            <li><strong>Test Active States:</strong> Select text, change font/size - dropdowns should show current selection</li>
            <li><strong>Test Mixed Selections:</strong> Select text with different fonts/sizes - dropdowns should handle gracefully</li>
            <li><strong>Test Formatting:</strong> Apply bold, italic, etc. - buttons should show active state</li>
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
