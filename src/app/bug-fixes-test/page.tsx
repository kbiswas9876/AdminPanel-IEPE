'use client'

import { useState } from 'react'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { EnhancedHTMLRenderer } from '@/components/editors/EnhancedHTMLRenderer'

export default function BugFixesTestPage() {
  const [content, setContent] = useState(`
    <h1>Bug Fixes Test Page</h1>
    <p>This page tests all the implemented bug fixes and new features.</p>
    
    <h2>Test 1: Cursor Visibility</h2>
    <p>Click in the empty area below to test cursor visibility. The cursor should be black and clearly visible on the white background.</p>
    <p>Empty paragraph for cursor testing:</p>
    <p></p>
    
    <h2>Test 2: Table Borders</h2>
    <p>Use the Table button in the toolbar to create a table. The table should have visible borders immediately upon creation.</p>
    <p>Sample table:</p>
    <table>
      <thead>
        <tr>
          <th>Header 1</th>
          <th>Header 2</th>
          <th>Header 3</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cell 1</td>
          <td>Cell 2</td>
          <td>Cell 3</td>
        </tr>
        <tr>
          <td>Cell 4</td>
          <td>Cell 5</td>
          <td>Cell 6</td>
        </tr>
      </tbody>
    </table>
    
    <h2>Test 3: Toolbar Active States</h2>
    <p>Select text and apply formatting (bold, italic, underline). The corresponding toolbar buttons should show active state (blue background).</p>
    <p><strong>This text is bold</strong> and <em>this text is italic</em> and <u>this text is underlined</u>.</p>
    
    <h2>Test 4: Font Size Control</h2>
    <p>Select text and use the Font Size dropdown in the toolbar to change font sizes.</p>
    <p style="font-size: 12px;">This text is 12px</p>
    <p style="font-size: 16px;">This text is 16px</p>
    <p style="font-size: 24px;">This text is 24px</p>
    <p style="font-size: 32px;">This text is 32px</p>
    
    <h2>Test 5: Font Family Control</h2>
    <p>Select text and use the Font Family dropdown to change fonts.</p>
    <p style="font-family: 'Times New Roman', serif;">This text is Times New Roman</p>
    <p style="font-family: 'Arial', sans-serif;">This text is Arial</p>
    <p style="font-family: 'Courier New', monospace;">This text is Courier New</p>
    
    <h2>Test 6: Color Picker</h2>
    <p>Select text and use the color picker button to change text colors.</p>
    <p style="color: red;">This text is red</p>
    <p style="color: blue;">This text is blue</p>
    <p style="color: green;">This text is green</p>
    
    <h2>Test 7: Math Rendering</h2>
    <p>Test inline math: $\\alpha + \\beta = \\gamma$</p>
    <p>Test display math:</p>
    $$\\sum_{i=0}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$$
    
    <h2>Test 8: Lists and Formatting</h2>
    <ul>
      <li>Bullet point 1</li>
      <li>Bullet point 2</li>
      <li>Bullet point 3</li>
    </ul>
    <ol>
      <li>Numbered item 1</li>
      <li>Numbered item 2</li>
      <li>Numbered item 3</li>
    </ol>
    
    <h2>Test 9: Text Alignment</h2>
    <p style="text-align: left;">Left aligned text</p>
    <p style="text-align: center;">Center aligned text</p>
    <p style="text-align: right;">Right aligned text</p>
    <p style="text-align: justify;">Justified text that should spread across the full width of the container to demonstrate the justification feature.</p>
  `)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Bug Fixes & Features Test Page</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Editor with All Fixes Applied:</h2>
        <div className="border rounded-lg p-4 bg-white">
          <ClientOnlyAdvancedTipTapEditor
            value={content}
            onChange={setContent}
            placeholder="Test all the bug fixes and new features here..."
            className="min-h-[400px]"
            showToolbar={true}
          />
        </div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">Test Instructions:</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <ol className="list-decimal list-inside space-y-2">
            <li><strong>Cursor Visibility:</strong> Click in empty areas - cursor should be black and visible</li>
            <li><strong>Table Borders:</strong> Use Table button - borders should be immediately visible</li>
            <li><strong>Toolbar States:</strong> Select text and apply formatting - buttons should show active state</li>
            <li><strong>Font Size:</strong> Use Font Size dropdown to change text sizes</li>
            <li><strong>Font Family:</strong> Use Font Family dropdown to change fonts</li>
            <li><strong>Color Picker:</strong> Use color picker to change text colors</li>
            <li><strong>Math:</strong> Test inline and display math rendering</li>
            <li><strong>Lists:</strong> Test bullet and numbered lists</li>
            <li><strong>Alignment:</strong> Test text alignment options</li>
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
