'use client'

import React from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { AdvancedTipTapEditor } from '@/components/editors/AdvancedTipTapEditor'

export default function ImageResizeTestPage() {
  const [unifiedContent, setUnifiedContent] = React.useState(`
    <p>Test image resize functionality:</p>
    <p>Try hovering over the images below to see resize handles, then drag the corners to resize.</p>
    <p>Upload your own images using drag & drop, paste, or the toolbar button.</p>
  `)
  
  const [advancedContent, setAdvancedContent] = React.useState(`
    <p>Advanced editor with image resize:</p>
    <img src="https://via.placeholder.com/250x150/dc3545/ffffff?text=Advanced+Test" alt="Advanced Test Image" />
    <p>This editor also supports image resizing.</p>
  `)

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Image Resize Functionality Test</h1>
      
      <div className="space-y-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">How to Test Image Resize:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Hover over images</strong> to see resize handles appear</li>
            <li><strong>Drag the corner handles</strong> to resize images</li>
            <li><strong>Upload new images</strong> using drag & drop, paste, or toolbar button</li>
            <li><strong>Maintain aspect ratio</strong> while resizing</li>
          </ul>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Unified Editor with Image Resize</h2>
          <UnifiedEditor
            value={unifiedContent}
            onChange={setUnifiedContent}
            placeholder="Test image resize functionality..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Advanced TipTap Editor with Image Resize</h2>
          <AdvancedTipTapEditor
            value={advancedContent}
            onChange={setAdvancedContent}
            placeholder="Test image resize functionality..."
          />
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Features:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li>✅ <strong>Visual resize handles</strong> - Blue circular handles on hover</li>
            <li>✅ <strong>Corner resizing</strong> - Drag any corner to resize</li>
            <li>✅ <strong>Aspect ratio preservation</strong> - Maintains image proportions</li>
            <li>✅ <strong>Hover effects</strong> - Blue border and handles on hover</li>
            <li>✅ <strong>Smooth transitions</strong> - Animated handle appearance</li>
            <li>✅ <strong>Minimum size limits</strong> - Prevents images from becoming too small</li>
          </ul>
        </div>

        <div className="bg-yellow-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-2">Technical Details:</h2>
          <ul className="list-disc list-inside space-y-1 text-sm">
            <li><strong>Extension:</strong> ImageResizeAdvancedExtension</li>
            <li><strong>Handles:</strong> 4 corner handles (NW, NE, SW, SE)</li>
            <li><strong>Cursor:</strong> Appropriate resize cursors for each handle</li>
            <li><strong>Styling:</strong> Blue handles with white borders and shadows</li>
            <li><strong>Responsive:</strong> Works with different image sizes</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
