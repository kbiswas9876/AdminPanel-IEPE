'use client'

import { useState } from 'react'
import { ClientOnlyAdvancedTipTapEditor } from '@/components/editors/ClientOnlyAdvancedTipTapEditor'
import { EnhancedHTMLRenderer } from '@/components/editors/EnhancedHTMLRenderer'

export default function TestEditorPage() {
  const [content, setContent] = useState(`
    <h1>Test Editor</h1>
    <p>This is a test of the advanced editor.</p>
    <p>Math test: $\\alpha + \\beta = \\gamma$</p>
    <p>Display math:</p>
    $$\\sum_{i=0}^n i^2 = \\frac{n(n+1)(2n+1)}{6}$$
    
    <h2>Table Test</h2>
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
    
    <h2>Color Test</h2>
    <p>Try selecting text and using the color picker button in the toolbar!</p>
    <p style="color: red;">This text is red</p>
    <p style="color: blue;">This text is blue</p>
    <p style="color: green;">This text is green</p>
    
    <h2>Cursor and Table Test</h2>
    <p>Click in the editor below to test cursor visibility. Try creating a table using the toolbar.</p>
    <p>Instructions:</p>
    <ol>
      <li>Click in the editor area - cursor should be visible</li>
      <li>Use the Table button in toolbar to insert a table</li>
      <li>Table borders should be clearly visible</li>
      <li>Try typing in table cells</li>
    </ol>
    
    <h2>Font Test</h2>
    <p>Test different fonts using the Font dropdown in the toolbar:</p>
    <p style="font-family: 'Times New Roman', serif;">This is Times New Roman</p>
    <p style="font-family: 'Georgia', serif;">This is Georgia</p>
    <p style="font-family: 'Cambria', serif;">This is Cambria</p>
    <p style="font-family: 'TeX Gyre Termes', serif;">This is TeX Gyre Termes</p>
    <p style="font-family: 'Bookerly', serif;">This is Bookerly</p>
    <p style="font-family: 'Roboto', sans-serif;">This is Roboto</p>
    <p style="font-family: 'Inter', sans-serif;">This is Inter</p>
    <p style="font-family: 'Fira Code', monospace;">This is Fira Code (monospace)</p>
  `)

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Editor Test</h1>
      
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Editor:</h2>
        <ClientOnlyAdvancedTipTapEditor
          value={content}
          onChange={setContent}
          placeholder="Type content here..."
          className="min-h-[300px]"
          showToolbar={true}
        />
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-2">Test Editor (for cursor and table testing):</h2>
        <ClientOnlyAdvancedTipTapEditor
          value="<p>Click here to test cursor visibility. Use the Table button to create a table.</p>"
          onChange={() => {}}
          placeholder="Test cursor and table functionality..."
          className="min-h-[200px]"
          showToolbar={true}
        />
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Rendered Output:</h2>
        <div className="border p-4 rounded-md bg-gray-50">
          <EnhancedHTMLRenderer content={content} />
        </div>
      </div>
    </div>
  )
}