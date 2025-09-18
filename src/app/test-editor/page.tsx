'use client'

import React, { useState } from 'react'
import { PremiumMarkdownEditor } from '@/components/editors/PremiumMarkdownEditor'

export default function TestEditorPage() {
  const [content, setContent] = useState(`
# Test Question

This is a **test question** with *italic text* and some math:

Inline math: $E = mc^2$

Block math:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

## Options

- **A)** Option A with $x^2$ math
- **B)** Option B with $\\alpha + \\beta$ math  
- **C)** Option C with $\\frac{a}{b}$ math
- **D)** Option D with $\\sum_{i=1}^{n} x_i$ math

## Solution

The correct answer is **A** because:

$$\\frac{d}{dx}(x^2) = 2x$$

And when $x = 1$:
$$2(1) = 2$$
  `)

  const handleSave = (markdown: string, prosemirrorJson: object) => {
    console.log('Saving content:', { markdown, prosemirrorJson })
  }

  const handleImageUpload = async (file: File): Promise<string> => {
    // Simulate image upload
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(`https://via.placeholder.com/400x300?text=${file.name}`)
      }, 1000)
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Advanced WYSIWYG Markdown Editor Test
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Question Editor</h2>
          <PremiumMarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Start typing your question..."
            showToolbar={true}
            onImageUpload={handleImageUpload}
            onSave={handleSave}
            className="min-h-[400px]"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Compact Editor (for options)</h2>
          <PremiumMarkdownEditor
            value="Option A: $x^2 + y^2 = z^2$"
            onChange={(value) => console.log('Option A changed:', value)}
            placeholder="Enter option text..."
            compact={true}
            showToolbar={false}
            className="min-h-[100px]"
          />
        </div>

        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-semibold mb-4">Current Content (HTML)</h2>
          <pre className="bg-gray-100 p-4 rounded-lg overflow-x-auto text-sm">
            {content}
          </pre>
        </div>
      </div>
    </div>
  )
}
